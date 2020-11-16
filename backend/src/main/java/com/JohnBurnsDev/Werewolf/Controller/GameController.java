package com.JohnBurnsDev.Werewolf.Controller;

import com.JohnBurnsDev.Werewolf.Model.Game;
import com.JohnBurnsDev.Werewolf.Model.Player;
import com.JohnBurnsDev.Werewolf.Service.GameService;
import com.JohnBurnsDev.Werewolf.Storage.GameList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
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

    @MessageMapping("/connect")
    public void playerConnect(@Header("simpSessionId") String sessionID) throws Exception {
        gameService.playerConnect(sessionID);
        System.out.println("Connected to player "+sessionID);
    }

    @MessageMapping("/game/create")
    public void createGame(@Payload Game game, @Header("simpSessionId") String sessionID) throws Exception {
        System.out.println("Creating game for host: "+game.getHost().getUsername()+
                " ("+sessionID+")");
        gameService.createGame(sessionID, game);
    }

    @MessageMapping("/game/join/{gameCode}")
    public void joinGame(@DestinationVariable String gameCode, @Payload Player player,
                         @Header("simpSessionId") String sessionID) throws Exception {
        System.out.println("Joining Player("+player.getUsername()+") to Game("+gameCode+")");
        gameService.joinGame(gameCode, player, sessionID);
    }

    @MessageMapping("/game/{gameCode}/ready")
    public void pregameReady(@DestinationVariable String gameCode,
                             @Header("simpSessionId") String sessionID) throws Exception {
        gameService.ready(gameCode, sessionID);
    }

    @GetMapping("/fetchAllGames")
    public Map fetchAll() {
        return GameList.getInstance().getGames();
    }
}
