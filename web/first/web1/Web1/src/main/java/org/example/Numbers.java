package org.example;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.example.Requester.sendError;

public class Numbers {
    public static Map<String, String> parseQueryString(String query) {
        Map<String, String> params = new HashMap<>();
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) {
                String key = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
                String value = URLDecoder.decode(kv[1], StandardCharsets.UTF_8);
                params.put(key, value);
            }
        }
        return params;
    }
    public static boolean validateQueryString( Map<String, String> params) {


        if (!params.containsKey("x") || !params.containsKey("y") || !params.containsKey("r")) {
            sendError("Отсутствуют обязательные параметры (x, y, r)");
            return false;
        }

        float x = Float.parseFloat(params.get("x"));
        float y = Float.parseFloat(params.get("y"));
        float r = Float.parseFloat(params.get("r"));

        if (x < -5 || x>3){
            sendError("x должен быть  из промежутка от [-5,3]");
            return false;
        }
        float[] MaybeR = {1,2,3,4,5};
        boolean found = false;
        for (float num : MaybeR) {
            if (num == r) {
                found = true;
                break;
            }
        }

        if (!found) {
            sendError("r должен быть  из промежутка от {1,2,3,4,5}");
            return false;
        }
        float[] MaybeY = {-3, -2, -1, 0, 1, 2, 3, 4, 5};
        found = false;
        for (float num : MaybeY) {
            if (num == y) {
                found = true;
                break;
            }
        }
        if (!found) {
            sendError("y должен быть  из промежутка от {-3, -2, -1, 0, 1, 2, 3, 4, 5}");
            return false;
        }

        return true;
    }
    public static boolean calculate(float x, float y, float r) {
        if (x <= 0 && y >= 0 && x >= -r / 2 && y <= r) return true;
        if (x >= 0 && y <= 0 && y >= -x - r / 2) return true;
        return x <= 0 && y <= 0 && (x * x + y * y) <= (r / 2) * (r / 2);
    }


}
