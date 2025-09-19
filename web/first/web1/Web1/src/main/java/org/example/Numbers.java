package org.example;

import java.math.BigDecimal;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@SuppressWarnings("checkstyle:RegexpMultiline")
public class Numbers {

    public static Map<String, List<String>> parseQueryString(String query) {
        Map<String, List<String>> params = new HashMap<>();
        if (query == null || query.isBlank()) return params;
        for (String pair : query.split("&")) {
            if (pair.isEmpty()) continue;
            String[] kv = pair.split("=", 2);
            String key = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
            String value = kv.length > 1 ? URLDecoder.decode(kv[1], StandardCharsets.UTF_8) : "";
            params.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
        }
        return params;
    }

    @SuppressWarnings({"checkstyle:NeedBraces", "checkstyle:LineLength"})
    public static ValidationResult validateAll(Map<String, List<String>> params) {
        List<Warning> warnings = new ArrayList<>();

        List<String> xs = params.get("x");
        List<String> ys = params.get("y");
        List<String> rs = params.get("r");

        if (xs == null) warnings.add(new Warning("x", "обязательный параметр"));
        else if (xs.size() != 1) warnings.add(new Warning("x", "должен быть указан ровно один раз"));

        if (ys == null) warnings.add(new Warning("y", "обязательный параметр"));
        else if (ys.size() != 1) warnings.add(new Warning("y", "должен быть указан ровно один раз"));

        if (rs == null) warnings.add(new Warning("r", "обязательный параметр"));
        else if (rs.size() != 1) warnings.add(new Warning("r", "должен быть указан ровно один раз"));

        if (!warnings.isEmpty()) return new ValidationResult(null, null, null, warnings);

        String xsVal = xs.get(0).trim();
        String ysVal = ys.get(0).trim();
        String rsVal = rs.get(0).trim();

        BigDecimal x = null;
        BigDecimal y = null;
        BigDecimal r = null;

        try {
            x = new BigDecimal(xsVal);
        } catch (Exception e) {
            warnings.add(new Warning("x", "должен быть числом"));
        }
        try {
            y = new BigDecimal(ysVal);
        } catch (Exception e) {
            warnings.add(new Warning("y", "должен быть числом"));
        }
        try {
            r = new BigDecimal(rsVal);
        } catch (Exception e) {
            warnings.add(new Warning("r", "должен быть числом"));
        }

        final Set<BigDecimal> MaybeY = Set.of(BigDecimal.valueOf(-3), BigDecimal.valueOf(-2), BigDecimal.valueOf(-1), BigDecimal.ZERO, BigDecimal.ONE, BigDecimal.valueOf(2), BigDecimal.valueOf(3), BigDecimal.valueOf(4), BigDecimal.valueOf(5));
        final Set<BigDecimal> MaybeR = Set.of(BigDecimal.valueOf(1), BigDecimal.valueOf(2), BigDecimal.valueOf(3), BigDecimal.valueOf(4), BigDecimal.valueOf(5));

        if (x != null) {
            if (x.compareTo(BigDecimal.valueOf(-5)) < 0 || x.compareTo(BigDecimal.valueOf(3)) > 0) {
                warnings.add(new Warning("x", "должен быть из промежутка [-5, 3]"));
            }
        }
        if (y != null && !MaybeY.contains(y.stripTrailingZeros())) {
            warnings.add(new Warning("y", "должен быть одним из {-3, -2, -1, 0, 1, 2, 3, 4, 5}"));
        }
        if (r != null && !MaybeR.contains(r.stripTrailingZeros())) {
            warnings.add(new Warning("r", "должен быть одним из {1, 2, 3, 4, 5}"));
        }

        return new ValidationResult(x, y, r, warnings);
    }

    public static boolean calculate(BigDecimal x, BigDecimal y, BigDecimal r) {
        float xf = x.floatValue();
        float yf = y.floatValue();
        float rf = r.floatValue();
        if (xf <= 0 && yf >= 0 && xf >= -rf / 2 && yf <= rf) return true;
        if (xf >= 0 && yf <= 0 && yf >= -xf - rf / 2) return true;
        return xf <= 0 && yf <= 0 && (xf * xf + yf * yf) <= (rf / 2) * (rf / 2);
    }


}
