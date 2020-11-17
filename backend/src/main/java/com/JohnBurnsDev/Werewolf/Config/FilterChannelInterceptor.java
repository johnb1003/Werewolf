package com.JohnBurnsDev.Werewolf.Config;

import com.JohnBurnsDev.Werewolf.Model.Game;
import com.JohnBurnsDev.Werewolf.Storage.GameList;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.ChannelInterceptorAdapter;

import javax.security.sasl.AuthenticationException;

public class FilterChannelInterceptor implements ChannelInterceptor {
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel){
        //System.out.println("Presend");
        StompHeaderAccessor headerAccessor= StompHeaderAccessor.wrap(message);
        if (StompCommand.SUBSCRIBE.equals(headerAccessor.getCommand())) {

            //System.out.println(headerAccessor.getSessionId()+" subscribing to: "+headerAccessor.getDestination());
            String gameCode = extractGameCode(headerAccessor.getDestination());
            if(gameCode != null) {
                if(!GameList.getInstance().getGames().containsKey(gameCode) ||
                        GameList.getInstance().getGames().get(gameCode).isFull()) {
                    // PREVENT SUBSCRIPTION
                    return null;
                }
            }
        }
        return message;
    }

    // Return game code of game subscription, null if for a personal subscription
    private String extractGameCode(String destination) {
        String gameDestination = "/topic/game/";
        if(destination.contains(gameDestination)) {
            return destination.substring(gameDestination.length());
        }
        return null;
    }

    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent){
        //System.out.println("Presend");
        StompHeaderAccessor headerAccessor= StompHeaderAccessor.wrap(message);
        if (sent) {
            //System.out.println(headerAccessor.getSessionId() + " accepted");
        }
    }
}
