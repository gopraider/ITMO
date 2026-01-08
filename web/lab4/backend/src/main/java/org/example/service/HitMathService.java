package org.example.service;

public class HitMathService {
    public static boolean isHit(double x, double y, double r) {
        if (x >= 0 && y >= 0 && x <= r/2 && y <= r/2) return true;
        if (x >= 0 && y <= 0 && (x*x + y*y) <= (r*r/4)) return true;
        if (x <= 0 && y >= 0 && y <= x + r) return true;
        return false;
    }
}
