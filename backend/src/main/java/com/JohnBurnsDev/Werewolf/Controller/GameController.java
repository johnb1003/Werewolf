package com.JohnBurnsDev.Werewolf.Controller;

import com.JohnBurnsDev.Werewolf.Model.Game;
import com.JohnBurnsDev.Werewolf.Model.Player;
import com.JohnBurnsDev.Werewolf.Service.GameService;
import com.JohnBurnsDev.Werewolf.Storage.GameList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Set;

@RestController
public class GameController {
    @Autowired
    GameService gameService;

    @MessageMapping("/game/create")
    public void createGame(@Payload Game game, SimpMessageHeaderAccessor headerAccessor) throws Exception {
        String sessionId = headerAccessor.getSessionAttributes().get("sessionID").toString();
        Player player = new Player(sessionId, game.getHost().getUsername());
        game.setHost(player);
        game.addPlayer(player);
        System.out.println("Creating game for host: "+game.getHost().getUsername()+
                " ("+game.getHost().getSessionID()+")");
        gameService.createGame(game);
    }

    @MessageMapping("/game/join/{gameCode}")
    public void joinGame(@DestinationVariable String gameCode, @Payload Game game,
                         SimpMessageHeaderAccessor headerAccessor) throws Exception {
        String sessionId = headerAccessor.getSessionAttributes().get("sessionId").toString();
        Player player = new Player(sessionId, game.getHost().getUsername());
        game.setHost(player);
        game.addPlayer(player);
        System.out.println("Creating game for host: "+game.getHost().getUsername()+
                " ("+game.getHost().getSessionID()+")");
        gameService.createGame(game);
    }

    @GetMapping("/fetchAllGames")
    public Map fetchAll() {
        return GameList.getInstance().getGames();
    }
}
