package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.example.ejb.HitRecordService;
import org.example.model.HitRecord;

import java.util.List;

@Path("/hits")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class HitResource {

    @EJB
    private HitRecordService service;

    @Context
    private HttpServletRequest req;

    private Long uid() {
        Object o = req.getSession().getAttribute("uid");
        return o == null ? null : (Long) o;
    }

    public static class HitInput {
        public double x;
        public double y;
        public double r;
    }

    @GET
    public List<HitRecord> getAll() {
        Long u = uid();
        if (u == null) throw new WebApplicationException(401);
        return service.findAllForUser(u);
    }

    @POST
    public HitRecord add(HitInput data) {
        Long u = uid();
        if (u == null) throw new WebApplicationException(401);
        return service.create(data.x, data.y, data.r, u);
    }

    @DELETE
    public void clear() {
        Long u = uid();
        if (u == null) throw new WebApplicationException(401);
        service.clear(u);
    }
}
