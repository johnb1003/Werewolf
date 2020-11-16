package com.JohnBurnsDev.Werewolf.Service;

import com.JohnBurnsDev.Werewolf.Model.Game;
import com.JohnBurnsDev.Werewolf.Model.Player;
import com.JohnBurnsDev.Werewolf.Storage.GameList;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class GameService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    ObjectMapper objectMapper;

    public void playerConnect(String sessionID) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor
                .create(SimpMessageType.MESSAGE);
        headerAccessor.setSessionId(sessionID);
        headerAccessor.setLeaveMutable(true);
        HashMap id = new HashMap();
        id.put("sessionID", sessionID);
        messagingTemplate.convertAndSendToUser(sessionID,"/topic/player", id,
                headerAccessor.getMessageHeaders());
    }

    public void createGame(String sessionID, Game game) throws Exception{
        Player player = new Player(sessionID, game.getHost().getUsername());
        game.setHost(player);
        //game.addPlayer(player);
        game.setGameCode(player.getSessionID());
        GameList.getInstance().updateGame(game.getGameCode(), game);
        HashMap newGame = new HashMap();
        newGame.put("type", "createGame");
        newGame.put("gameCode", game.getGameCode());
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor
                .create(SimpMessageType.MESSAGE);
        headerAccessor.setSessionId(sessionID);
        headerAccessor.setLeaveMutable(true);
        messagingTemplate.convertAndSendToUser(sessionID,"/topic/player", newGame,
                headerAccessor.getMessageHeaders());
    }

    public void joinGame(String gameCode, Player play, String sessionID) throws Exception{
        Player player = new Player(sessionID, play.getUsername());
        String joined = GameList.getInstance().getGames().get(gameCode).addPlayer(player);
        if(joined != null) {
            HashMap pregameUpdate = new HashMap();
            pregameUpdate.put("type", "pregameUpdate");
            pregameUpdate.put("game", GameList.getInstance().getGames().get(gameCode));
            messagingTemplate.convertAndSend("/topic/game/"+gameCode, pregameUpdate);
        }
        else {
            SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor
                    .create(SimpMessageType.MESSAGE);
            headerAccessor.setSessionId(sessionID);
            headerAccessor.setLeaveMutable(true);
            HashMap errorMessage = new HashMap();
            errorMessage.put("type", "error");
            errorMessage.put("errorType", "join");
            messagingTemplate.convertAndSendToUser(sessionID, "/topic/player",
                    errorMessage, headerAccessor.getMessageHeaders());
        }
    }

    public void ready(String gameCode, String sessionID) {
        GameList.getInstance().getGames().get(gameCode).playerReady(sessionID, true);
        // All players readied up
        if(GameList.getInstance().getGames().get(gameCode).allReady()) {
            GameList.getInstance().getGames().get(gameCode).unreadyAll();
            // Pregame => Deal cards
            if(GameList.getInstance().getGames().get(gameCode).isPregame()) {
                // Deal cards
                GameList.getInstance().getGames().get(gameCode).dealCards();
                ArrayList<Player> players = GameList.getInstance().getGames().get(gameCode).getPlayers();
                for (int i=0; i < players.size(); i++) {
                    HashMap dealCards = new HashMap();
                    dealCards.put("type", "dealCards");
                    dealCards.put("character", players.get(i).getCharacter());

                    String playerID = players.get(i).getSessionID();
                    SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor
                            .create(SimpMessageType.MESSAGE);
                    headerAccessor.setSessionId(playerID);
                    headerAccessor.setLeaveMutable(true);

                    messagingTemplate.convertAndSendToUser(playerID, "/topic/player",
                            dealCards, headerAccessor.getMessageHeaders());
                }
                GameList.getInstance().getGames().get(gameCode).setPregame(false);
            }
            // All players viewed cards
            else if(GameList.getInstance().getGames().get(gameCode).cardsDealt()) {
                // Start night time
            }
        }
        else {
            // Update all clients
            HashMap pregameUpdate = new HashMap();
            pregameUpdate.put("type", "pregameUpdate");
            pregameUpdate.put("game", GameList.getInstance().getGames().get(gameCode));
            messagingTemplate.convertAndSend("/topic/game/"+gameCode, pregameUpdate);
        }
    }
}
