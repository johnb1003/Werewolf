package com.JohnBurnsDev.Werewolf.Config;

import com.JohnBurnsDev.Werewolf.Service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;
import org.springframework.web.socket.server.HandshakeInterceptor;

import javax.servlet.http.HttpSession;
import java.util.Map;

@Component
public class StompEventListener {

    @Autowired
    GameService gameService;

    @EventListener
    private void handleSessionConnected(SessionConnectEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        //System.out.println("Connected: "+sha.getSessionId());
    }

    @EventListener
    private void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        gameService.removePlayer(sha.getSessionId());
        //System.out.println("Disconnected: " + sha.getSessionId());
    }

    @EventListener
    private void handleSessionSubscribeEvent(SessionSubscribeEvent event) {
        //System.out.println("Session Subscribe: "+event.getSource().toString());
    }

    @EventListener
    private void handleSessionUnsubscribeEvent(SessionUnsubscribeEvent event) {
        //System.out.println("Session Unsubscribe: "+event.getSource().toString());
    }
}
