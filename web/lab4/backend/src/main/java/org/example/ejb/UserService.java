package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.model.User;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Stateless
public class UserService {

    @PersistenceContext(unitName = "areaPU")
    private EntityManager em;

    public User find(String login) {
        return em.createQuery("SELECT u FROM User u WHERE u.login = :login", User.class)
                .setParameter("login", login)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public User register(String login, String password) {
        User u = new User();
        u.setLogin(login);
        u.setPasswordHash(hash(password));
        em.persist(u);
        return u;
    }

    public User login(String login, String password) {
        User u = find(login);
        if (u == null) return null;
        return u.getPasswordHash().equals(hash(password)) ? u : null;
    }

    private String hash(String s) {
        try {
            var md = MessageDigest.getInstance("SHA-256");
            byte[] data = md.digest(s.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : data) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
