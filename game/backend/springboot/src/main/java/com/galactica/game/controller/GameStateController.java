package com.galactica.game.controller;

import com.galactica.game.model.GameState;
import com.galactica.game.service.GameStateService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "*")
public class GameStateController {
    private final GameStateService service;

    public GameStateController(GameStateService service) {
        this.service = service;
    }

    @GetMapping("/{code}")
    public GameState getState(@PathVariable String code) {
        return service.getOrCreate(code);
    }

    @PutMapping("/{code}")
    public GameState setState(@PathVariable String code, @RequestBody GameState state) {
        return service.setState(code, state);
    }

    @PatchMapping("/{code}")
    public GameState updateState(@PathVariable String code, @RequestBody Map<String, Object> updates) {
        return service.applyUpdates(code, updates);
    }

    @PostMapping("/{code}/reset")
    public GameState reset(@PathVariable String code) {
        return service.reset(code);
    }

    @PostMapping("/{code}/start")
    public GameState start(@PathVariable String code) {
        return service.startGame(code);
    }
}
