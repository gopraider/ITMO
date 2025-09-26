package org.example.util;

import java.math.BigDecimal;
import java.util.Set;

public final class Validation {

    private Validation() {}
    private static final Set<Integer> ALLOWED_Y =
            Set.of(-3, -2, -1, 0, 1, 2, 3, 4, 5);
    private static final double X_MIN = -3.0;
    private static final double X_MAX =  3.0;
    private static final Set<BigDecimal> ALLOWED_R =
            Set.of(new BigDecimal("1"),
                    new BigDecimal("1.5"),
                    new BigDecimal("2"),
                    new BigDecimal("2.5"),
                    new BigDecimal("3"));

    public static String validateAll(String xStr, String yStr, String rStr) {
        BigDecimal bx = parseDecimalSafe(xStr);
        if (bx == null) return "X должен быть числом.";
        if (bx.doubleValue() < X_MIN || bx.doubleValue() > X_MAX)
            return "X должен быть в диапазоне от -3 до 3.";

        BigDecimal by = parseDecimalSafe(yStr);
        if (by == null) return "Y должен быть числом.";
        if (!ALLOWED_Y.contains(by.intValue()) || by.doubleValue() != by.intValue())
            return "Y должен быть одним из значений: -3, -2, -1, 0, 1, 2, 3, 4, 5.";

        BigDecimal br = parseDecimalSafe(rStr);
        if (br == null) return "R должен быть числом.";
        if (!ALLOWED_R.contains(br))
            return "R должен быть одним из значений: 1, 1.5, 2, 2.5, 3.";

        return null;
    }

    public static BigDecimal parseDecimal(String s) {
        if (s == null) throw new IllegalArgumentException("null");
        return new BigDecimal(s.trim().replace(',', '.'));
    }

    public static BigDecimal parseDecimalSafe(String s) {
        try {
            return parseDecimal(s);
        } catch (Exception e) {
            return null;
        }
    }
}
