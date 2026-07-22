const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, 'game-state.js'), 'utf8');
const questionsSource = fs.readFileSync(path.join(__dirname, 'questions.js'), 'utf8');

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function createStorage(initial = {}) {
    const values = new Map(Object.entries(initial));
    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, String(value));
        },
        removeItem(key) {
            values.delete(key);
        }
    };
}

function loadGameState(initialRemote = {}) {
    const calls = [];
    const listeners = new Map();
    const localStorage = createStorage();
    let remote = { lastUpdate: 1, ...clone(initialRemote) };

    class FakeEvent {
        constructor(type) {
            this.type = type;
        }
    }

    const window = {
        addEventListener(type, callback) {
            const callbacks = listeners.get(type) || new Set();
            callbacks.add(callback);
            listeners.set(type, callbacks);
        },
        removeEventListener(type, callback) {
            listeners.get(type)?.delete(callback);
        },
        dispatchEvent(event) {
            for (const callback of listeners.get(event.type) || []) callback(event);
        }
    };

    async function fetch(url, options = {}) {
        const method = options.method || 'GET';
        calls.push({ url, method, body: options.body });

        if (method === 'PATCH') {
            remote = {
                ...remote,
                ...JSON.parse(options.body),
                lastUpdate: (remote.lastUpdate || 0) + 1
            };
        } else if (method === 'POST' && url.endsWith('/reset')) {
            remote = { lastUpdate: (remote.lastUpdate || 0) + 1 };
        }

        return {
            ok: true,
            async json() {
                return clone(remote);
            }
        };
    }

    const context = vm.createContext({
        console,
        Event: FakeEvent,
        fetch,
        localStorage,
        setInterval: () => 1,
        clearInterval: () => {},
        window
    });
    vm.runInContext(source, context, { filename: 'game-state.js' });

    return {
        calls,
        context,
        GameState: vm.runInContext('GameState', context)
    };
}

function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

test('joining a session reads remote state without resetting it', async () => {
    const { calls, GameState } = loadGameState({ gameStarted: true, lastUpdate: 25 });

    GameState.setSession('room42');
    await flushPromises();

    assert.deepEqual(calls.map(call => call.method), ['GET']);
    assert.equal(GameState.get().gameStarted, true);
});

test('updates persist one partial PATCH and never a full PUT', async () => {
    const { calls, GameState } = loadGameState({ lastUpdate: 10 });
    GameState.setSession('shared');
    await flushPromises();
    calls.length = 0;

    GameState.update({ team1DarkMatter: 10 });
    await flushPromises();

    assert.deepEqual(calls.map(call => call.method), ['PATCH']);
    assert.deepEqual(JSON.parse(calls[0].body), { team1DarkMatter: 10 });
});

test('winner detection waits for a started, populated game and counts hits', () => {
    const { GameState } = loadGameState();
    const state = GameState.createInitialState(1);

    GameState.saveLocalState(state);
    assert.equal(GameState.checkWinner(), null);

    state.gameStarted = true;
    state.team1Board[0] = 1;
    state.team2Board[1] = 1;
    GameState.saveLocalState(state);
    assert.equal(GameState.checkWinner(), null);

    state.team1Attacks[1] = 2;
    GameState.saveLocalState(state);
    assert.equal(GameState.checkWinner(), 'team1');
});

test('shared custom questions replace the active team question set', () => {
    const { context, GameState } = loadGameState();
    vm.runInContext(questionsSource, context, { filename: 'questions.js' });

    GameState.update({
        customQuestions: [{
            category: 'Custom',
            question: 'Shared question',
            options: ['A', 'B', 'C', 'D'],
            correct: 2
        }]
    });

    const questions = JSON.parse(vm.runInContext('JSON.stringify(QUESTIONS)', context));
    assert.equal(questions.length, 1);
    assert.equal(questions[0].question, 'Shared question');
});
