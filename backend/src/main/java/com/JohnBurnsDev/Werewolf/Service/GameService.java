package com.JohnBurnsDev.Werewolf.Service;

import com.JohnBurnsDev.Werewolf.Model.Game;
import com.JohnBurnsDev.Werewolf.Storage.GameList;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class GameService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    ObjectMapper objectMapper;

    public void createGame(Game game) throws Exception{
        ObjectNode newRoom = objectMapper.createObjectNode();
        GameList.getInstance().updateGame(game.getGameCode(), game);
    }
}
