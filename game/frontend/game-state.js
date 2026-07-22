// Sistema de gestión de estado compartido para el juego multijugador
// Usa localStorage para sincronizar entre diferentes ventanas del navegador

const GameState = {
    storageKey: 'gameState',
    sessionCode: null,
    apiBase: localStorage.getItem('gameApiBase') || 'https://solar-system-war-1.onrender.com/api',
    cache: null,
    syncTimer: null,
    syncIntervalMs: 1000,
    pendingWrites: 0,
    // Inicializar el estado del juego
    init() {
        const savedCode = localStorage.getItem('gameSessionCode');
        if (savedCode) {
            this.setSession(savedCode);
            return;
        }

        if (!localStorage.getItem(this.storageKey)) {
            this.saveLocalState(this.createInitialState());
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
            this.saveLocalState(this.createInitialState(0));
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
            this.saveLocalState(this.createInitialState());
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

    createInitialState(lastUpdate = Date.now()) {
        return {
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
            team1SpyReveals: new Array(2500).fill(0), // 0=sin escanear 1=vacío 2=planeta detectado
            team2SpyReveals: new Array(2500).fill(0),
            customQuestions: [],
            pendingQuestion: null, // Pregunta pendiente de responder
            currentTurn: 'team1',
            gameStarted: false,
            lastUpdate
        };
    },

    normalizeState(state) {
        const defaults = this.createInitialState(0);
        return {
            ...defaults,
            ...state,
            team1Board: Array.isArray(state?.team1Board) ? state.team1Board : defaults.team1Board,
            team2Board: Array.isArray(state?.team2Board) ? state.team2Board : defaults.team2Board,
            team1Attacks: Array.isArray(state?.team1Attacks) ? state.team1Attacks : defaults.team1Attacks,
            team2Attacks: Array.isArray(state?.team2Attacks) ? state.team2Attacks : defaults.team2Attacks,
            team1SpyReveals: Array.isArray(state?.team1SpyReveals) ? state.team1SpyReveals : defaults.team1SpyReveals,
            team2SpyReveals: Array.isArray(state?.team2SpyReveals) ? state.team2SpyReveals : defaults.team2SpyReveals,
            customQuestions: Array.isArray(state?.customQuestions) ? state.customQuestions : []
        };
    },

    saveLocalState(state) {
        localStorage.setItem(this.storageKey, JSON.stringify(state));
        this.cache = state;
    },

    // Resetear el estado del juego
    reset() {
        const initialState = this.createInitialState();
        this.saveLocalState(initialState);
        this.resetRemote();
        window.dispatchEvent(new Event('gamestatechanged'));
    },

    getLocalState() {
        const state = localStorage.getItem(this.storageKey);
        if (!state) return null;
        try {
            return this.normalizeState(JSON.parse(state));
        } catch (e) {
            return null;
        }
    },

    // Obtener el estado completo
    get() {
        if (!this.cache) {
            this.cache = this.getLocalState();
        }
        return this.cache;
    },

    // Actualizar solo una parte del estado
    update(updates) {
        const state = { ...this.get(), ...updates };
        this.saveLocalState(state);
        this.persistUpdates(updates);
        window.dispatchEvent(new Event('gamestatechanged'));
    },

    // Colocar planetas de un equipo
    setTeamPlanets(team, board, planets) {
        if (team === 'team1') {
            this.update({ team1Board: board, team1Planets: planets });
        } else {
            this.update({ team2Board: board, team2Planets: planets });
        }
    },

    // Escanear un sector con la sonda (sin atacar, cambia el turno)
    spySector(spyingTeam, targetIndices) {
        const state = this.get();
        const targetBoard = spyingTeam === 'team1' ? state.team2Board : state.team1Board;
        const revealsKey  = spyingTeam === 'team1' ? 'team1SpyReveals' : 'team2SpyReveals';
        const reveals = Array.isArray(state[revealsKey])
            ? [...state[revealsKey]]
            : new Array(2500).fill(0);
        const attacksKey = spyingTeam === 'team1' ? 'team1Attacks' : 'team2Attacks';

        let planetsFound = 0;
        for (const idx of targetIndices) {
            if (idx < 0 || idx >= 2500) continue;
            // No sobreescribir ataques ya realizados
            if (state[attacksKey][idx] !== 0) continue;
            const hasPlanet = targetBoard[idx] === 1;
            reveals[idx] = hasPlanet ? 2 : 1;
            if (hasPlanet) planetsFound++;
        }

        // La sonda gasta el turno
        this.update({
            [revealsKey]: reveals,
            currentTurn: spyingTeam === 'team1' ? 'team2' : 'team1'
        });
        return {
            valid: true,
            planetsFound,
            message: `🛸 Sector escaneado: ${planetsFound > 0 ? '⚠️ ' + planetsFound + ' señal(es) de planeta detectada(s)' : '✅ Área despejada'}`
        };
    },

    // Registrar un ataque (soporta múltiples celdas)
    attack(attackingTeam, targetIndices) {
        const state = this.get();
        const targetBoard = attackingTeam === 'team1' ? state.team2Board : state.team1Board;
        const attacksKey = attackingTeam === 'team1' ? 'team1Attacks' : 'team2Attacks';
        const attacksArray = [...state[attacksKey]];
        
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
        
        // Cambiar turno
        this.update({
            [attacksKey]: attacksArray,
            currentTurn: attackingTeam === 'team1' ? 'team2' : 'team1'
        });
        
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
        if (!state?.gameStarted) return null;

        const team1Ready = state.team1Board.includes(1);
        const team2Ready = state.team2Board.includes(1);
        if (!team1Ready || !team2Ready) return null;

        const team1Destroyed = state.team1Board.every(
            (cell, index) => cell !== 1 || state.team2Attacks[index] === 2
        );
        const team2Destroyed = state.team2Board.every(
            (cell, index) => cell !== 1 || state.team1Attacks[index] === 2
        );
        
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
        const key = team === 'team1' ? 'team1DarkMatter' : 'team2DarkMatter';
        this.update({ [key]: (state[key] || 0) + amount });
    },

    // Comprar un arma
    buyWeapon(team, weaponType, cost) {
        const state = this.get();
        const darkMatter = team === 'team1' ? state.team1DarkMatter : state.team2DarkMatter;
        
        if (darkMatter < cost) {
            return { success: false, message: 'No tienes suficiente Materia Oscura' };
        }
        
        if (team === 'team1') {
            this.update({
                team1DarkMatter: darkMatter - cost,
                team1Weapon: weaponType
            });
        } else {
            this.update({
                team2DarkMatter: darkMatter - cost,
                team2Weapon: weaponType
            });
        }
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
        const key = team === 'team1' ? 'team1UsedQuestions' : 'team2UsedQuestions';
        const usedQuestions = Array.isArray(state[key]) ? [...state[key]] : [];
        if (!usedQuestions.includes(questionIndex)) usedQuestions.push(questionIndex);
        this.update({ [key]: usedQuestions });
    },

    async persistUpdates(updates) {
        if (!this.sessionCode) return;
        this.pendingWrites++;
        try {
            const res = await fetch(`${this.apiBase}/game/${this.sessionCode}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) this.applyRemoteState(await res.json());
        } catch (e) {
            // Fallback silencioso si el backend no está disponible
        } finally {
            this.pendingWrites--;
        }
    },

    async resetRemote() {
        if (!this.sessionCode) return;
        this.pendingWrites++;
        try {
            const res = await fetch(`${this.apiBase}/game/${this.sessionCode}/reset`, {
                method: 'POST'
            });
            if (res.ok) this.applyRemoteState(await res.json(), true);
        } catch (e) {
            // Fallback silencioso si el backend no está disponible
        } finally {
            this.pendingWrites--;
        }
    },

    async syncFromServer() {
        if (!this.sessionCode || this.pendingWrites > 0) return;
        try {
            const res = await fetch(`${this.apiBase}/game/${this.sessionCode}`);
            if (!res.ok) return;
            const remote = await res.json();
            this.applyRemoteState(remote);
        } catch (e) {
            // Fallback silencioso si el backend no está disponible
        }
    },

    applyRemoteState(remote, force = false) {
        const normalized = this.normalizeState(remote);
        const local = this.get();
        if (force || !local || (normalized.lastUpdate || 0) > (local.lastUpdate || 0)) {
            this.saveLocalState(normalized);
            window.dispatchEvent(new Event('gamestatechanged'));
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
