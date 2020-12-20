package com.JohnBurnsDev.Werewolf.Storage;

import com.JohnBurnsDev.Werewolf.Model.CharacterType;
import com.JohnBurnsDev.Werewolf.Model.Game;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public class GameList {
    private static GameList storage;
    private HashMap<String, Game> games;
    private static final ArrayList<CharacterType> TURN_ORDER =
            new ArrayList<CharacterType>(Arrays.asList(CharacterType.DOPPELGANGER, CharacterType.WEREWOLF,
                    CharacterType.MINION, CharacterType.MASON, CharacterType.SEER, CharacterType.ROBBER,
                    CharacterType.TROUBLEMAKER, CharacterType.DRUNK, CharacterType.INSOMNIAC,
                    CharacterType.HUNTER, CharacterType.TANNER, CharacterType.VILLAGER));

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

    public static ArrayList<CharacterType> getTurnOrder() {
        return TURN_ORDER;
    }
}
