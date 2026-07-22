package com.galactica.game.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.galactica.game.model.GameState;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameStateService {
    private final ConcurrentHashMap<String, GameState> states = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();

    public GameState getOrCreate(String code) {
        return states.computeIfAbsent(code, key -> createInitialState());
    }

    public GameState reset(String code) {
        GameState state = createInitialState();
        states.put(code, state);
        return state;
    }

    public GameState setState(String code, GameState state) {
        state.setLastUpdate(System.currentTimeMillis());
        states.put(code, state);
        return state;
    }

    public GameState applyUpdates(String code, Map<String, Object> updates) {
        return states.compute(code, (key, current) -> {
            GameState state = current == null ? createInitialState() : current;
            ObjectNode node = mapper.valueToTree(state);
            ObjectNode updatesNode = mapper.convertValue(updates, ObjectNode.class);
            node.setAll(updatesNode);
            try {
                GameState merged = mapper.treeToValue(node, GameState.class);
                merged.setLastUpdate(System.currentTimeMillis());
                return merged;
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid game state update", e);
            }
        });
    }

    public GameState startGame(String code) {
        return states.compute(code, (key, current) -> {
            GameState state = current == null ? createInitialState() : current;
            state.setGameStarted(true);
            state.setLastUpdate(System.currentTimeMillis());
            return state;
        });
    }

    private GameState createInitialState() {
        GameState state = new GameState();
        state.setTeam1Board(new int[2500]);
        state.setTeam2Board(new int[2500]);
        state.setTeam1Attacks(new int[2500]);
        state.setTeam2Attacks(new int[2500]);
        state.setTeam1Planets(Map.of());
        state.setTeam2Planets(Map.of());
        state.setTeam1DarkMatter(0);
        state.setTeam2DarkMatter(0);
        state.setTeam1Weapon("laser-pequeño");
        state.setTeam2Weapon("laser-pequeño");
        state.setTeam1UsedQuestions(List.of());
        state.setTeam2UsedQuestions(List.of());
        state.setTeam1SpyReveals(new int[2500]);
        state.setTeam2SpyReveals(new int[2500]);
        state.setCustomQuestions(List.of());
        state.setPendingQuestion(null);
        state.setCurrentTurn("team1");
        state.setGameStarted(false);
        state.setLastUpdate(System.currentTimeMillis());
        return state;
    }
}
