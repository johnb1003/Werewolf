package com.JohnBurnsDev.Werewolf.Model;

import org.springframework.lang.Nullable;

import java.util.ArrayList;

public class Game {
    @Nullable
    private String gameCode;
    private Player host;
    @Nullable
    private ArrayList<Player> players;
    @Nullable
    private ArrayList<ChatMessage> chat;
    private ArrayList<CharacterType> characters;

    public Game() {

    }

    public String getGameCode() {
        return gameCode;
    }

    public void setGameCode(String gameCode) {
        this.gameCode = gameCode;
    }

    public Player getHost() {
        return host;
    }

    public void setHost(Player host) {
        this.host = host;
    }

    @Nullable
    public ArrayList<Player> getPlayers() {
        return players;
    }

    public void setPlayers(@Nullable ArrayList<Player> players) {
        this.players = players;
    }

    public void addPlayer(Player player) {
        this.players.add(player);
    }

    @Nullable
    public ArrayList<ChatMessage> getChat() {
        return chat;
    }

    public void setChat(@Nullable ArrayList<ChatMessage> chat) {
        this.chat = chat;
    }

    public ArrayList<CharacterType> getCharacters() {
        return characters;
    }

    public void setCharacters(ArrayList<CharacterType> characters) {
        this.characters = characters;
    }
}
