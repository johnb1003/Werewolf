package com.JohnBurnsDev.Werewolf.Storage;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

public class PlayerList {
    private static PlayerList storage;
    private HashMap<String, String> players;

    public PlayerList() {
        players = new HashMap<String, String>();
    }

    public static synchronized PlayerList getInstance() {
        if(storage == null) {
            storage = new PlayerList();
        }
        return storage;
    }

    public HashMap<String, String> getPlayers() {
        return this.players;
    }

    public void setPlayer(String player, String gameCode) {
        this.players.put(player, gameCode);
    }

    public String getPlayer(String player) {
        return this.players.get(player);
    }

    public String removePlayer(String player) {
        return this.players.remove(player);
    }
}
