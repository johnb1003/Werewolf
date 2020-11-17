package com.JohnBurnsDev.Werewolf.Storage;

import com.JohnBurnsDev.Werewolf.Model.Game;

import java.util.HashMap;

public class GameList {
    private static GameList storage;
    private HashMap<String, Game> games;

    public GameList() {
        games = new HashMap<String, Game>();
    }

    public static synchronized GameList getInstance() {
        if(storage == null) {
            storage = new GameList();
        }
        return storage;
    }

    public HashMap<String, Game> getGames() {
        return games;
    }

    public void updateGame(String gameCode, Game game) {
        games.put(gameCode, game);
    }

    public void removeGame(String gameCode) {
        games.remove(gameCode);
    }
}
