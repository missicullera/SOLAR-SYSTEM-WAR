package com.galactica.game.service;

import com.galactica.game.model.GameState;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GameStateServiceTest {

    @Test
    void initialStateContainsAllSharedFields() {
        GameState state = new GameStateService().reset("INITIAL");

        assertAll(
                () -> assertEquals(2500, state.getTeam1SpyReveals().length),
                () -> assertEquals(2500, state.getTeam2SpyReveals().length),
                () -> assertNotNull(state.getCustomQuestions()),
                () -> assertTrue(state.getCustomQuestions().isEmpty())
        );
    }

    @Test
    void partialUpdatesPreserveScansAndQuestions() {
        GameStateService service = new GameStateService();
        List<Map<String, Object>> questions = List.of(Map.of(
                "category", "Ciencias",
                "question", "¿Cuántos planetas hay?",
                "options", List.of("7", "8", "9", "10"),
                "correct", 1
        ));

        service.applyUpdates("SHARED", Map.of(
                "team1SpyReveals", List.of(2, 1, 0),
                "customQuestions", questions
        ));
        GameState state = service.applyUpdates("SHARED", Map.of("team1DarkMatter", 10));

        assertAll(
                () -> assertArrayEquals(new int[]{2, 1, 0}, state.getTeam1SpyReveals()),
                () -> assertEquals(questions, state.getCustomQuestions()),
                () -> assertEquals(10, state.getTeam1DarkMatter())
        );
    }

    @Test
    void concurrentPartialUpdatesDoNotOverwriteEachOther() throws Exception {
        GameStateService service = new GameStateService();
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch start = new CountDownLatch(1);

        try {
            Future<?> team1 = executor.submit(() -> {
                await(start);
                service.applyUpdates("RACE", Map.of("team1DarkMatter", 10));
            });
            Future<?> team2 = executor.submit(() -> {
                await(start);
                service.applyUpdates("RACE", Map.of("team2DarkMatter", 20));
            });

            start.countDown();
            team1.get();
            team2.get();

            GameState state = service.getOrCreate("RACE");
            assertAll(
                    () -> assertEquals(10, state.getTeam1DarkMatter()),
                    () -> assertEquals(20, state.getTeam2DarkMatter())
            );
        } finally {
            executor.shutdownNow();
        }
    }

    private static void await(CountDownLatch latch) {
        try {
            latch.await();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }
}
