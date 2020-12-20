package com.JohnBurnsDev.Werewolf.Comparator;
import com.JohnBurnsDev.Werewolf.Model.Player;
import com.JohnBurnsDev.Werewolf.Storage.GameList;

import java.util.Comparator;

public class PlayerComparator implements Comparator<Player> {
    @Override
    public int compare(Player p1, Player p2) {
        return GameList.getTurnOrder().subList(GameList.getTurnOrder().indexOf(p1.getCharacter()),
                GameList.getTurnOrder().size()).contains(p2.getCharacter()) ? -1 : 1;
    }
}
