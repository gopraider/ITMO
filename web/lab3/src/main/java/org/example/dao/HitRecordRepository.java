package org.example.dao;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.annotation.PreDestroy;
import jakarta.persistence.*;
import org.example.model.HitRecord;

import java.io.Serializable;
import java.util.List;

@ApplicationScoped
public class HitRecordRepository implements Serializable {

    private static final EntityManagerFactory emf =
            Persistence.createEntityManagerFactory("areaPU");

    private final EntityManager em = emf.createEntityManager();

    public List<HitRecord> findAll() {
        return em.createQuery("select h from HitRecord h order by h.id desc", HitRecord.class)
                .getResultList();
    }

    public void save(HitRecord rec) {
        EntityTransaction tx = em.getTransaction();
        try {//transactional
            tx.begin();
            em.persist(rec);
            tx.commit();
        } catch (RuntimeException e) {
            if (tx.isActive()) tx.rollback();
            throw e;
        }
    }

    public void clearAll() {
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();
            em.createQuery("delete from HitRecord").executeUpdate();
            tx.commit();
        } catch (RuntimeException e) {
            if (tx.isActive()) tx.rollback();
            throw e;
        }
    }

    @PreDestroy
    public void close() {
        if (em.isOpen()) em.close();
        if (emf.isOpen()) emf.close();
    }
}
