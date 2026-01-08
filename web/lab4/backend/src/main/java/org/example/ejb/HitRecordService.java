package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.persistence.*;
import org.example.model.HitRecord;
import org.example.service.HitMathService;

import java.time.LocalDateTime;
import java.util.List;

@Stateless
public class HitRecordService {

    @PersistenceContext(unitName = "areaPU")
    private EntityManager em;

    public List<HitRecord> findAllForUser(Long userId) {
        return em.createQuery(
                        "SELECT h FROM HitRecord h WHERE h.userId = :uid ORDER BY h.id DESC",
                        HitRecord.class)
                .setParameter("uid", userId)
                .getResultList();
    }

    public HitRecord create(double x, double y, double r, Long userId) {
        long start = System.nanoTime();

        HitRecord rec = new HitRecord();
        rec.setX(x);
        rec.setY(y);
        rec.setR(r);
        rec.setTime(LocalDateTime.now());
        rec.setHit(HitMathService.isHit(x, y, r));
        rec.setExecTimeMs((System.nanoTime() - start) / 1_000_000);

        em.persist(rec);
        return rec;
    }

    public void clear(Long userId) {
        em.createQuery("DELETE FROM HitRecord").executeUpdate();
    }
}
