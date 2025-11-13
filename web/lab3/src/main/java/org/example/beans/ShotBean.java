package org.example.beans;

import jakarta.enterprise.context.SessionScoped;
import jakarta.inject.Named;
import org.example.dao.HitRecordRepository;
import org.example.model.HitRecord;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

import static org.example.service.HitService.isHit;

@Named
@SessionScoped
public class ShotBean implements Serializable {
    private double x;
    private double y;
    private double r = 1;

    private final HitRecordRepository repository = new HitRecordRepository();
    private List<HitRecord> history;
    public ShotBean() {
        history = repository.findAll();
    }

    public void shoot() {
        long start = System.nanoTime();

        boolean hit = isHit(x, y, r);

        HitRecord rec = new HitRecord();
        rec.setX(x);
        rec.setY(y);
        rec.setR(r);
        rec.setHit(hit);
        rec.setTime(LocalDateTime.now());
        rec.setExecTimeMs((System.nanoTime() - start) / 1_000_000);

        repository.save(rec);
        history = repository.findAll();
    }

    public void clear() {
        repository.clearAll();
        history = repository.findAll();
    }



    public double getX() { return x; }
    public void setX(double x) { this.x = x; }
    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
    public double getR() { return r; }
    public void setR(double r) { this.r = r; }

    public List<HitRecord> getHistory() { return history; }
}
