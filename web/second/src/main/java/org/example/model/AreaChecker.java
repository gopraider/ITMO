package org.example.model;

public final class AreaChecker {

    private AreaChecker() {}
    public static boolean calculate(double x, double y, double r) {

        boolean inRect = (x >= -r && x <= 0) && (y >= 0 && y <= r / 2.0);

        boolean inTri = (x >= 0 && y >= 0 && x <= r && y <= (r - x));

        boolean inCircle = (x <= 0 && y <= 0 && (x * x + y * y) <= (r * r / 4.0));

        return inRect || inTri || inCircle;
    }
}
