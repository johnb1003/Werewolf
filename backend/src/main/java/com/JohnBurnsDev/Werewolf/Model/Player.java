package com.JohnBurnsDev.Werewolf.Model;

import com.JohnBurnsDev.Werewolf.Storage.GameList;
import org.springframework.lang.Nullable;

public class Player{
    private String username;
    @Nullable
    private String sessionID;
    private boolean isReady;
    private CharacterType character;

    public Player(String sessionID, String name) {
        this.sessionID = sessionID;
        this.username = name;
        this.isReady = false;
        this.character = null;
    }

    public String getSessionID() {
        return sessionID;
    }

    public void setSessionID(String sessionID) {
        this.sessionID = sessionID;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public boolean isReady() {
        return isReady;
    }

    public void setReady(boolean ready) {
        isReady = ready;
    }

    public CharacterType getCharacter() {
        return character;
    }

    public void setCharacter(CharacterType character) {
        this.character = character;
    }
}
