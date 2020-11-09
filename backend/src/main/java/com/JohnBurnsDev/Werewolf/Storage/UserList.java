package com.JohnBurnsDev.Werewolf.Storage;

import java.util.HashSet;
import java.util.Set;

public class UserList {
    private static UserList storage;
    private Set<String> users;

    public UserList() {
        users = new HashSet<String>();
    }

    public static synchronized UserList getInstance() {
        if(storage == null) {
            storage = new UserList();
        }
        return storage;
    }

    public Set<String> getUsers() {
        return users;
    }

    public boolean setUser(String userName) {
        if(users.contains(userName)) {
            return false;
        }
        users.add(userName);
        return true;
    }
}
