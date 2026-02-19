// ============================================================
// SOLAR SYSTEM WAR - Motor de Audio (Web Audio API)
// Música retro estilo arcade + efectos de sonido
// ============================================================

const SoundEngine = (() => {
    let ctx = null;
    let masterGain = null;
    let musicGain = null;
    let sfxGain = null;
    let bassGain = null;

    let musicPlaying = false;
    let muted = false;

    let melodyTimer = null;
    let bassTimer = null;

    // --- Volúmenes ---
    const MUSIC_VOL = 0.20;
    const BASS_VOL  = 0.12;
    const SFX_VOL   = 0.60;

    // --- Notas (frecuencias en Hz) ---
    const N = {
        R:   0,
        C2: 65.41,  G2: 98.00,
        C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, B3: 246.94,
        C4: 261.63, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
        C5: 523.25, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
        C6: 1046.50,
    };

    // BPM = 104  =>  1 beat = 577ms,  S = 288ms  (tempo Star Wars)
    const BPM  = 104;
    const BEAT = 60000 / BPM;
    const S    = BEAT / 2; // corchea (ms)

    // ═══════════════════════════════════════════════════════════
    // STAR WARS - Main Title  (John Williams)  ~2:03 min
    // Transcripción completa en Do mayor — 7 secciones
    // Cada entrada: [frecuencia Hz, pasos de corchea (S=288ms)]
    // ═══════════════════════════════════════════════════════════
    const MELODY = [

        // ── SECCIÓN 1: Fanfarria principal (1ª vez) ──────────────
        // "da-da-da  DUM-da  DUM ..."
        [N.G4,2],[N.G4,2],[N.G4,2],                // pickup sol
        [N.C5,3],[N.G5,1],                          // do· sol
        [N.F5,2],[N.E5,1],[N.D5,1],                // fa mi re
        [N.C6,4],[N.G5,2],                          // do(largo) sol
        [N.F5,2],[N.E5,1],[N.D5,1],                // fa mi re
        [N.C6,4],[N.G5,2],                          // do(largo) sol
        [N.F5,2],[N.E5,1],[N.F5,1],                // fa mi fa
        [N.C5,6],[N.R,6],                           // resolución + pausa

        // ── SECCIÓN 2: Fanfarria (2ª vez, mayor energía) ─────────
        [N.G4,2],[N.G4,2],[N.G4,2],
        [N.C5,3],[N.G5,1],
        [N.F5,2],[N.E5,1],[N.D5,1],
        [N.C6,4],[N.G5,2],
        [N.F5,2],[N.E5,1],[N.D5,1],
        [N.C6,4],[N.G5,2],
        [N.F5,2],[N.E5,1],[N.F5,1],
        [N.C5,8],[N.R,4],                           // nota larga + pausa

        // ── SECCIÓN 3: Tema de La Fuerza (lírico y suave) ────────
        [N.C5,4],[N.B4,2],[N.A4,2],                // do si la
        [N.G4,4],[N.F4,2],[N.G4,2],                // sol fa sol
        [N.A4,6],[N.R,2],                           // la (largo)
        [N.C5,4],[N.D5,4],                          // do re
        [N.E5,4],[N.D5,2],[N.C5,2],                // mi re do
        [N.B4,4],[N.A4,4],                          // si la
        [N.G4,8],[N.R,8],                           // sol (muy largo) + pausa
        [N.F4,4],[N.G4,4],                          // fa sol
        [N.A4,4],[N.G4,2],[N.F4,2],                // la sol fa
        [N.E4,4],[N.D4,2],[N.C4,2],                // mi re do
        [N.D4,6],[N.R,2],                           // re (largo)
        [N.G4,4],[N.A4,4],                          // sol la
        [N.B4,4],[N.C5,8],[N.R,4],                 // si do(largo) pausa

        // ── SECCIÓN 4: Variación marcial (pickup en Mi5) ─────────
        [N.E5,2],[N.E5,2],[N.E5,2],                // pickup alternativo
        [N.C5,3],[N.G5,1],
        [N.F5,2],[N.E5,1],[N.D5,1],
        [N.C6,4],[N.G5,2],
        [N.F5,2],[N.E5,1],[N.D5,1],
        [N.C6,4],[N.G5,2],
        [N.F5,2],[N.E5,1],[N.F5,1],
        [N.G5,4],[N.R,4],

        // ── SECCIÓN 5: Puente oscuro (sabor Marcha Imperial) ─────
        [N.G4,2],[N.G4,2],[N.G4,2],
        [N.Eb5,3],[N.Bb4,1],
        [N.G4,2],[N.Eb5,1],[N.Bb4,1],[N.G4,4],
        [N.R,2],
        [N.D5,2],[N.D5,2],[N.D5,2],
        [N.Eb5,3],[N.Bb4,1],
        [N.G4,2],[N.Eb5,1],[N.Bb4,1],[N.G4,4],
        [N.R,4],
        [N.G4,2],[N.C5,2],[N.G4,2],
        [N.F4,3],[N.Eb4,1],
        [N.D4,2],[N.G3,2],[N.G3,4],
        [N.G4,2],[N.Ab4,2],[N.G4,2],               // pequeño giro cromático
        [N.F4,3],[N.Eb4,1],
        [N.D4,2],[N.C4,2],[N.G3,4],
        [N.R,4],

        // ── SECCIÓN 6: Regreso triunfante al tema principal ───────
        [N.G4,2],[N.G4,2],[N.G4,2],
        [N.C5,3],[N.G5,1],
        [N.F5,2],[N.E5,1],[N.D5,1],
        [N.C6,4],[N.G5,2],
        [N.F5,2],[N.E5,1],[N.D5,1],
        [N.C6,4],[N.G5,2],
        [N.F5,2],[N.E5,1],[N.F5,1],
        [N.C5,6],[N.R,4],

        // ── SECCIÓN 7: Gran final con coda ───────────────────────
        [N.G4,2],[N.G4,2],[N.G4,2],
        [N.C5,3],[N.G5,1],
        [N.F5,2],[N.E5,1],[N.D5,1],
        [N.C6,4],[N.G5,2],
        [N.F5,2],[N.E5,1],[N.D5,1],
        [N.C6,4],[N.G5,2],
        [N.F5,2],[N.E5,1],[N.F5,1],
        [N.G5,4],[N.A5,4],                         // escalada final
        [N.C6,12],[N.R,12],                         // nota final larga + silencio
    ];
    // Total aprox: 428 corcheas × 288ms ≈ 2 min 3 seg

    // Bajo marcial en Do mayor (ostinato independiente)
    const BASS = [
        [N.C3,4],[N.R,2],[N.G3,4],[N.R,2],
        [N.C3,4],[N.R,2],[N.G3,4],[N.R,2],
        [N.F3,4],[N.R,2],[N.C3,4],[N.R,2],
        [N.G3,4],[N.R,2],[N.D3,4],[N.R,2],
        [N.C3,4],[N.R,2],[N.E3,4],[N.R,2],
        [N.F3,4],[N.C3,4],[N.G3,8],
        [N.C3,8],[N.R,4],
    ];

    // ---- Contexto de audio ----
    function getCtx() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();

            masterGain = ctx.createGain();
            masterGain.gain.value = muted ? 0 : 1;
            masterGain.connect(ctx.destination);

            musicGain = ctx.createGain();
            musicGain.gain.value = MUSIC_VOL;
            musicGain.connect(masterGain);

            bassGain = ctx.createGain();
            bassGain.gain.value = BASS_VOL;
            bassGain.connect(masterGain);

            sfxGain = ctx.createGain();
            sfxGain.gain.value = SFX_VOL;
            sfxGain.connect(masterGain);
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    // ---- Reproducir nota sintetizada ----
    function playNote(freq, durMs, gainNode, type = 'square') {
        if (!freq || freq <= 0) return;
        const ac = getCtx();
        const osc  = ac.createOscillator();
        const env  = ac.createGain();
        const now  = ac.currentTime;
        const durS = durMs / 1000;

        osc.type = type;
        osc.frequency.value = freq;

        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(1, now + 0.01);
        env.gain.setValueAtTime(1, now + Math.max(durS - 0.05, 0.01));
        env.gain.linearRampToValueAtTime(0, now + durS);

        osc.connect(env);
        env.connect(gainNode);
        osc.start(now);
        osc.stop(now + durS + 0.05);
    }

    // ---- Secuenciador genérico ----
    function runSeq(seq, gainNode, type, idx, timerRef) {
        if (!musicPlaying) return;
        const [freq, steps] = seq[idx % seq.length];
        const dur = steps * S;
        playNote(freq, dur * 0.88, gainNode, type);

        const t = setTimeout(() => {
            runSeq(seq, gainNode, type, (idx + 1) % seq.length, timerRef);
        }, dur);
        timerRef.id = t;
    }

    // ---- API pública ----

    function startMusic() {
        if (musicPlaying) return;
        musicPlaying = true;
        getCtx();

        const melRef = { id: null };
        const basRef = { id: null };
        melodyTimer = melRef;
        bassTimer   = basRef;

        runSeq(MELODY, musicGain, 'triangle', 0, melRef);
        // El bajo empieza ligeramente desplazado para sonar más lleno
        setTimeout(() => runSeq(BASS, bassGain, 'sawtooth', 0, basRef), S);

        _updateBtn();
    }

    function stopMusic() {
        musicPlaying = false;
        if (melodyTimer) clearTimeout(melodyTimer.id);
        if (bassTimer)   clearTimeout(bassTimer.id);
        _updateBtn();
    }

    function toggleMusic() {
        musicPlaying ? stopMusic() : startMusic();
    }

    function toggleMute() {
        muted = !muted;
        if (masterGain) masterGain.gain.value = muted ? 0 : 1;
        _updateBtn();
    }

    function _updateBtn() {
        const btn = document.getElementById('sound-toggle-btn');
        if (!btn) return;
        if (muted)          btn.textContent = '🔇';
        else if (musicPlaying) btn.textContent = '🔊';
        else                btn.textContent = '🔈';
        btn.title = muted ? 'Sonido silenciado' : (musicPlaying ? 'Click para pausar música' : 'Click para iniciar música');
    }

    // ---- Efectos de sonido ----

    /** Explosión (impacto en planeta) */
    function playExplosion() {
        const ac  = getCtx();
        const now = ac.currentTime;

        // Ruido blanco con filtro paso-bajo → "boom" de detonación
        const bufSize = Math.floor(ac.sampleRate * 0.9);
        const buf  = ac.createBuffer(1, bufSize, ac.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

        const noise     = ac.createBufferSource();
        noise.buffer    = buf;
        const noiseEnv  = ac.createGain();
        const noiseFilter = ac.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1200, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(80, now + 0.6);
        noiseEnv.gain.setValueAtTime(1.4, now);
        noiseEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseEnv);
        noiseEnv.connect(sfxGain);
        noise.start(now);
        noise.stop(now + 0.9);

        // Tono grave descendente ("thump")
        const boom     = ac.createOscillator();
        const boomEnv  = ac.createGain();
        boom.type = 'sine';
        boom.frequency.setValueAtTime(140, now);
        boom.frequency.exponentialRampToValueAtTime(25, now + 0.35);
        boomEnv.gain.setValueAtTime(1.8, now);
        boomEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        boom.connect(boomEnv);
        boomEnv.connect(sfxGain);
        boom.start(now);
        boom.stop(now + 0.45);
    }

    /** Agua / fallo */
    function playMiss() {
        const ac  = getCtx();
        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const env = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.38);
        env.gain.setValueAtTime(0.45, now);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(env);
        env.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.42);
    }

    /** Victoria */
    function playVictory() {
        const ac = getCtx();
        const fanfare = [
            [N.C4,150],[N.E4,150],[N.G4,150],[N.C5,300],[N.R,80],[N.G4,150],[N.C5,500],
        ];
        let delay = 0;
        for (const [freq, dur] of fanfare) {
            if (freq > 0) {
                const t   = ac.currentTime + delay / 1000;
                const osc = ac.createOscillator();
                const env = ac.createGain();
                osc.type = 'square';
                osc.frequency.value = freq;
                env.gain.setValueAtTime(0.5, t);
                env.gain.linearRampToValueAtTime(0.001, t + dur / 1000);
                osc.connect(env);
                env.connect(sfxGain);
                osc.start(t);
                osc.stop(t + dur / 1000 + 0.05);
            }
            delay += dur;
        }
    }

    /** Derrota */
    function playDefeat() {
        const ac = getCtx();
        const fanfare = [
            [N.G4, 200],[N.F4, 200],[N.Eb4, 200],[N.D4, 300],[N.C4, 700],
        ];
        let delay = 0;
        for (const [freq, dur] of fanfare) {
            const t   = ac.currentTime + delay / 1000;
            const osc = ac.createOscillator();
            const env = ac.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            env.gain.setValueAtTime(0.45, t);
            env.gain.linearRampToValueAtTime(0.001, t + dur / 1000);
            osc.connect(env);
            env.connect(sfxGain);
            osc.start(t);
            osc.stop(t + dur / 1000 + 0.05);
            delay += dur;
        }
    }

    return { startMusic, stopMusic, toggleMusic, toggleMute, playExplosion, playMiss, playVictory, playDefeat };
})();

// Arrancar la música con el primer gesto del usuario (política de autoplay)
document.addEventListener('click', function _startAudio() {
    SoundEngine.startMusic();
    document.removeEventListener('click', _startAudio);
}, { once: true });
