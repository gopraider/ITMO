package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import org.example.ejb.UserService;
import org.example.model.User;

@Path("/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @EJB
    private UserService users;

    @Context
    private HttpServletRequest req;

    public static class Credentials {
        public String login;
        public String password;
    }

    @POST
    @Path("/login")
    public Response login(Credentials c) {
        User u = users.login(c.login, c.password);
        if (u == null)
            return Response.status(401).build();

        HttpSession session = req.getSession(true);
        session.setAttribute("uid", u.getId());

        return Response.ok().build();
    }

    @POST
    @Path("/logout")
    public Response logout() {
        HttpSession s = req.getSession(false);
        if (s != null) s.invalidate();
        return Response.ok().build();
    }
}
