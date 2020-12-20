package com.JohnBurnsDev.Werewolf.Model;

import com.JohnBurnsDev.Werewolf.Comparator.PlayerComparator;
import org.springframework.lang.Nullable;

import java.util.ArrayList;
import java.util.Collections;
import java.util.stream.Collectors;

public class Game {
    @Nullable
    private String gameCode;
    private Player host;
    @Nullable
    private ArrayList<Player> players;
    @Nullable
    private ArrayList<ChatMessage> chat;
    private ArrayList<CharacterType> characters;
    private CharacterType[] middleCards;
    private boolean pregame;
    private boolean cardsDealt;
    private boolean isLive;
    private int turnNum;

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

    public String addPlayer(Player player) {
        String added;
        if(this.players.size() >= this.characters.size()-3) {
            added = null;
        }
        else {
            this.players.add(player);
            added = this.gameCode;
        }
        return added;
    }

    public Game removePlayer(String playerID) {
        for(int i=0; i<this.players.size(); i++) {
            if(this.players.get(i).getSessionID().equals(playerID)) {
                this.players.remove(i);
                break;
            }
        }
        return this;
    }

    public void playerReady(String playerID, boolean ready) {
        for(int i=0; i<this.players.size(); i++) {
            if(this.players.get(i).getSessionID().equals(playerID)) {
                this.players.get(i).setReady(ready);
                break;
            }
        }
    }

    public boolean allReady() {
        for(int i=0; i<this.players.size(); i++) {
            if(!this.players.get(i).isReady()) {
                return false;
            }
        }
        return true;
    }

    public int numPlayersReady() {
        int sum=0;
        for(int i=0; i<this.players.size(); i++) {
            if(this.players.get(i).isReady()) {
                sum++;
            }
        }
        return sum;
    }

    public void unreadyAll() {
        for(int i=0; i<this.players.size(); i++) {
            this.players.get(i).setReady(false);
        }
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

    public CharacterType[] getMiddleCards() {
        return middleCards;
    }

    public void setMiddleCards(CharacterType[] middleCards) {
        this.middleCards = middleCards;
    }

    public boolean isPregame() {
        return pregame;
    }

    public void setPregame(boolean pregame) {
        this.pregame = pregame;
    }

    public boolean cardsDealt() {
        return cardsDealt;
    }

    public void setCardsDealt(boolean cardsDealt) {
        this.cardsDealt = cardsDealt;
    }

    public void dealCards() {
        ArrayList<CharacterType> tempCards = new ArrayList(this.characters);
        for(int i=0; i<this.players.size(); i++) {
            int randomIndex = (int)Math.floor(Math.random() * tempCards.size());
            this.players.get(i).setCharacter(tempCards.remove(randomIndex));
        }
        this.setMiddleCards(tempCards.toArray(new CharacterType[0]));
        this.pregame = false;
        this.cardsDealt = true;
        Collections.sort(this.players, new PlayerComparator());
    }

    public boolean isFull() {
        return this.players.size() >= this.characters.size() - 3;
    }

    public boolean isLive() {
        return isLive;
    }

    public void setLive(boolean live) {
        isLive = live;
    }

    public int getTurnNum() {
        return turnNum;
    }

    public void setTurnNum(int turnNum) {
        this.turnNum = turnNum;
    }

    public CharacterType getCharacterBySessionID(String sessionID) {
        for(int i=0; i<this.players.size(); i++) {
            if(this.players.get(i).getSessionID() == sessionID) {
                return this.players.get(i).getCharacter();
            }
        }
        return null;
    }

    public ArrayList<Player> getPlayersByTurnNum(int turn) {
        CharacterType character = this.players.get(turn).getCharacter();
        return new ArrayList(this.players.stream().map((player) -> player.getCharacter() == character).collect(Collectors.toList()));
    }
}
