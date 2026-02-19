// Sistema de gestión de estado compartido para el juego multijugador
// Usa localStorage para sincronizar entre diferentes ventanas del navegador

const GameState = {
    storageKey: 'gameState',
    sessionCode: null,
    apiBase: localStorage.getItem('gameApiBase') || 'https://solar-system-war-1.onrender.com/api',
    cache: null,
    syncTimer: null,
    syncIntervalMs: 1000,
    // Inicializar el estado del juego
    init() {
        const savedCode = localStorage.getItem('gameSessionCode');
        if (savedCode) {
            this.setSession(savedCode);
        }

        if (!localStorage.getItem(this.storageKey)) {
            this.reset();
        }

        this.cache = this.getLocalState();
        this.startSync();
    },

    setSession(code) {
        const cleanCode = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        if (!cleanCode) return;
        this.sessionCode = cleanCode;
        this.storageKey = `gameState:${cleanCode}`;
        localStorage.setItem('gameSessionCode', cleanCode);

        if (!localStorage.getItem(this.storageKey)) {
            this.reset();
        }

        this.cache = this.getLocalState();
        this.startSync();
        this.syncFromServer();
    },

    clearSession() {
        this.sessionCode = null;
        this.storageKey = 'gameState';
        localStorage.removeItem('gameSessionCode');
        if (!localStorage.getItem(this.storageKey)) {
            this.reset();
        }
        this.cache = this.getLocalState();
    },

    generateSessionCode(length = 6) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    // Resetear el estado del juego
    reset() {
        const initialState = {
            team1Board: new Array(2500).fill(0), // 50x50 = 2500
            team2Board: new Array(2500).fill(0),
            team1Attacks: new Array(2500).fill(0), // 0=no atacado, 1=agua, 2=impacto
            team2Attacks: new Array(2500).fill(0),
            team1Planets: {},
            team2Planets: {},
            team1DarkMatter: 0, // Materia Oscura del equipo 1
            team2DarkMatter: 0, // Materia Oscura del equipo 2
            team1Weapon: 'laser-pequeño', // Arma actual del equipo 1
            team2Weapon: 'laser-pequeño', // Arma actual del equipo 2
            team1UsedQuestions: [], // Preguntas ya usadas por equipo 1
            team2UsedQuestions: [], // Preguntas ya usadas por equipo 2
            pendingQuestion: null, // Pregunta pendiente de responder
            currentTurn: 'team1',
            gameStarted: false,
            lastUpdate: Date.now()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(initialState));
        this.cache = initialState;
        this.persistState(initialState);
        window.dispatchEvent(new Event('gamestatechanged'));
    },

    getLocalState() {
        const state = localStorage.getItem(this.storageKey);
        return state ? JSON.parse(state) : null;
    },

    // Obtener el estado completo
    get() {
        if (!this.cache) {
            this.cache = this.getLocalState();
        }
        return this.cache;
    },

    // Actualizar el estado completo
    set(newState) {
        newState.lastUpdate = Date.now();
        localStorage.setItem(this.storageKey, JSON.stringify(newState));
        this.cache = newState;
        this.persistState(newState);
        window.dispatchEvent(new Event('gamestatechanged'));
    },

    // Actualizar solo una parte del estado
    update(updates) {
        const state = this.get();
        Object.assign(state, updates);
        this.set(state);
        this.persistUpdates(updates);
    },

    // Colocar planetas de un equipo
    setTeamPlanets(team, board, planets) {
        const state = this.get();
        if (team === 'team1') {
            state.team1Board = board;
            state.team1Planets = planets;
        } else {
            state.team2Board = board;
            state.team2Planets = planets;
        }
        this.set(state);
    },

    // Registrar un ataque (soporta múltiples celdas)
    attack(attackingTeam, targetIndices) {
        const state = this.get();
        const targetBoard = attackingTeam === 'team1' ? state.team2Board : state.team1Board;
        const attacksArray = attackingTeam === 'team1' ? state.team1Attacks : state.team2Attacks;
        
        // Convertir a array si es un solo índice
        if (!Array.isArray(targetIndices)) {
            targetIndices = [targetIndices];
        }
        
        // Verificar si alguna celda ya fue atacada
        for (const index of targetIndices) {
            if (attacksArray[index] !== 0) {
                return { valid: false, message: 'Ya se atacó alguna de estas posiciones' };
            }
        }

        // Registrar los ataques
        let hits = 0;
        let misses = 0;
        
        for (const index of targetIndices) {
            if (targetBoard[index] === 1) {
                // Impacto
                attacksArray[index] = 2;
                hits++;
            } else {
                // Agua
                attacksArray[index] = 1;
                misses++;
            }
        }
        
        if (attackingTeam === 'team1') {
            state.team1Attacks = attacksArray;
        } else {
            state.team2Attacks = attacksArray;
        }
        
        // Cambiar turno
        state.currentTurn = attackingTeam === 'team1' ? 'team2' : 'team1';
        this.set(state);
        
        if (hits > 0 && misses > 0) {
            return { valid: true, hit: true, hits, misses, message: `¡${hits} IMPACTO(S)! ${misses} agua(s)` };
        } else if (hits > 0) {
            return { valid: true, hit: true, hits, misses, message: `¡${hits} IMPACTO(S)! Destrucción total` };
        } else {
            return { valid: true, hit: false, hits, misses, message: 'Agua... Todo vacío espacial' };
        }
    },

    // Verificar si hay un ganador
    checkWinner() {
        const state = this.get();
        const team1Destroyed = !state.team1Board.includes(1);
        const team2Destroyed = !state.team2Board.includes(1);
        
        if (team1Destroyed) {
            return 'team2';
        } else if (team2Destroyed) {
            return 'team1';
        }
        return null;
    },

    // Iniciar el juego
    startGame() {
        this.update({ gameStarted: true });
    },

    // Agregar Materia Oscura a un equipo
    addDarkMatter(team, amount) {
        const state = this.get();
        if (team === 'team1') {
            state.team1DarkMatter += amount;
        } else {
            state.team2DarkMatter += amount;
        }
        this.set(state);
    },

    // Comprar un arma
    buyWeapon(team, weaponType, cost) {
        const state = this.get();
        const darkMatter = team === 'team1' ? state.team1DarkMatter : state.team2DarkMatter;
        
        if (darkMatter < cost) {
            return { success: false, message: 'No tienes suficiente Materia Oscura' };
        }
        
        if (team === 'team1') {
            state.team1DarkMatter -= cost;
            state.team1Weapon = weaponType;
        } else {
            state.team2DarkMatter -= cost;
            state.team2Weapon = weaponType;
        }
        this.set(state);
        return { success: true, message: `Arma ${weaponType} comprada` };
    },

    // Establecer pregunta pendiente
    setPendingQuestion(question) {
        this.update({ pendingQuestion: question });
    },

    // Limpiar pregunta pendiente
    clearPendingQuestion() {
        this.update({ pendingQuestion: null });
    },

    // Marcar pregunta como usada
    markQuestionUsed(team, questionIndex) {
        const state = this.get();
        if (team === 'team1') {
            if (!state.team1UsedQuestions) state.team1UsedQuestions = [];
            if (!state.team1UsedQuestions.includes(questionIndex)) {
                state.team1UsedQuestions.push(questionIndex);
            }
        } else {
            if (!state.team2UsedQuestions) state.team2UsedQuestions = [];
            if (!state.team2UsedQuestions.includes(questionIndex)) {
                state.team2UsedQuestions.push(questionIndex);
            }
        }
        this.set(state);
    },

    async persistState(state) {
        if (!this.sessionCode) return;
        try {
            await fetch(`${this.apiBase}/game/${this.sessionCode}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state)
            });
        } catch (e) {
            // Fallback silencioso si el backend no está disponible
        }
    },

    async persistUpdates(updates) {
        if (!this.sessionCode) return;
        try {
            await fetch(`${this.apiBase}/game/${this.sessionCode}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (e) {
            // Fallback silencioso si el backend no está disponible
        }
    },

    async syncFromServer() {
        if (!this.sessionCode) return;
        try {
            const res = await fetch(`${this.apiBase}/game/${this.sessionCode}`);
            if (!res.ok) return;
            const remote = await res.json();
            const local = this.get();
            if (!local || (remote.lastUpdate && remote.lastUpdate > (local.lastUpdate || 0))) {
                localStorage.setItem(this.storageKey, JSON.stringify(remote));
                this.cache = remote;
                window.dispatchEvent(new Event('gamestatechanged'));
            }
        } catch (e) {
            // Fallback silencioso si el backend no está disponible
        }
    },

    startSync() {
        if (this.syncTimer) return;
        this.syncTimer = setInterval(() => this.syncFromServer(), this.syncIntervalMs);
    },

    // Escuchar cambios en el estado
    onChange(callback) {
        window.addEventListener('storage', callback);
        window.addEventListener('gamestatechanged', callback);
    },

    // Dejar de escuchar cambios
    offChange(callback) {
        window.removeEventListener('storage', callback);
        window.removeEventListener('gamestatechanged', callback);
    }
};

// Inicializar al cargar
GameState.init();
