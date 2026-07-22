package com.galactica.game.model;

import java.util.List;
import java.util.Map;

public class GameState {
    private int[] team1Board;
    private int[] team2Board;
    private int[] team1Attacks;
    private int[] team2Attacks;
    private Map<String, Object> team1Planets;
    private Map<String, Object> team2Planets;
    private int team1DarkMatter;
    private int team2DarkMatter;
    private String team1Weapon;
    private String team2Weapon;
    private List<Integer> team1UsedQuestions;
    private List<Integer> team2UsedQuestions;
    private int[] team1SpyReveals;
    private int[] team2SpyReveals;
    private List<Map<String, Object>> customQuestions;
    private Object pendingQuestion;
    private String currentTurn;
    private boolean gameStarted;
    private long lastUpdate;

    public int[] getTeam1Board() {
        return team1Board;
    }

    public void setTeam1Board(int[] team1Board) {
        this.team1Board = team1Board;
    }

    public int[] getTeam2Board() {
        return team2Board;
    }

    public void setTeam2Board(int[] team2Board) {
        this.team2Board = team2Board;
    }

    public int[] getTeam1Attacks() {
        return team1Attacks;
    }

    public void setTeam1Attacks(int[] team1Attacks) {
        this.team1Attacks = team1Attacks;
    }

    public int[] getTeam2Attacks() {
        return team2Attacks;
    }

    public void setTeam2Attacks(int[] team2Attacks) {
        this.team2Attacks = team2Attacks;
    }

    public Map<String, Object> getTeam1Planets() {
        return team1Planets;
    }

    public void setTeam1Planets(Map<String, Object> team1Planets) {
        this.team1Planets = team1Planets;
    }

    public Map<String, Object> getTeam2Planets() {
        return team2Planets;
    }

    public void setTeam2Planets(Map<String, Object> team2Planets) {
        this.team2Planets = team2Planets;
    }

    public int getTeam1DarkMatter() {
        return team1DarkMatter;
    }

    public void setTeam1DarkMatter(int team1DarkMatter) {
        this.team1DarkMatter = team1DarkMatter;
    }

    public int getTeam2DarkMatter() {
        return team2DarkMatter;
    }

    public void setTeam2DarkMatter(int team2DarkMatter) {
        this.team2DarkMatter = team2DarkMatter;
    }

    public String getTeam1Weapon() {
        return team1Weapon;
    }

    public void setTeam1Weapon(String team1Weapon) {
        this.team1Weapon = team1Weapon;
    }

    public String getTeam2Weapon() {
        return team2Weapon;
    }

    public void setTeam2Weapon(String team2Weapon) {
        this.team2Weapon = team2Weapon;
    }

    public List<Integer> getTeam1UsedQuestions() {
        return team1UsedQuestions;
    }

    public void setTeam1UsedQuestions(List<Integer> team1UsedQuestions) {
        this.team1UsedQuestions = team1UsedQuestions;
    }

    public List<Integer> getTeam2UsedQuestions() {
        return team2UsedQuestions;
    }

    public void setTeam2UsedQuestions(List<Integer> team2UsedQuestions) {
        this.team2UsedQuestions = team2UsedQuestions;
    }

    public int[] getTeam1SpyReveals() {
        return team1SpyReveals;
    }

    public void setTeam1SpyReveals(int[] team1SpyReveals) {
        this.team1SpyReveals = team1SpyReveals;
    }

    public int[] getTeam2SpyReveals() {
        return team2SpyReveals;
    }

    public void setTeam2SpyReveals(int[] team2SpyReveals) {
        this.team2SpyReveals = team2SpyReveals;
    }

    public List<Map<String, Object>> getCustomQuestions() {
        return customQuestions;
    }

    public void setCustomQuestions(List<Map<String, Object>> customQuestions) {
        this.customQuestions = customQuestions;
    }

    public Object getPendingQuestion() {
        return pendingQuestion;
    }

    public void setPendingQuestion(Object pendingQuestion) {
        this.pendingQuestion = pendingQuestion;
    }

    public String getCurrentTurn() {
        return currentTurn;
    }

    public void setCurrentTurn(String currentTurn) {
        this.currentTurn = currentTurn;
    }

    public boolean isGameStarted() {
        return gameStarted;
    }

    public void setGameStarted(boolean gameStarted) {
        this.gameStarted = gameStarted;
    }

    public long getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(long lastUpdate) {
        this.lastUpdate = lastUpdate;
    }
}
