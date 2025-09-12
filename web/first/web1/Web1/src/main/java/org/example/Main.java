package org.example;

import com.fastcgi.FCGIInterface;
import java.time.Instant;
import java.util.*;


import static org.example.Numbers.*;
import static org.example.Requester.SendMessage;
import static org.example.Requester.sendError;

public class Main {


    public static void main(String[] args) {
        FCGIInterface fcgi = new FCGIInterface();

        while (fcgi.FCGIaccept() >= 0) {
            try {
                Map<String, String> env = getFcgiParams();
                String queryString = env.get("QUERY_STRING");
                if (queryString == null || queryString.isBlank()) {
                    sendError("QUERY_STRING пустой или отсутствует");
                    continue;
                }

                Map<String, String> params = parseQueryString(queryString);
                validateQueryString(params);
                var startTime = Instant.now();
                float x = Float.parseFloat(params.get("x"));
                float y = Float.parseFloat(params.get("y"));
                float r = Float.parseFloat(params.get("r"));
                boolean result = calculate(x, y, r);
                var endTime = Instant.now();
                SendMessage(startTime, endTime, result);


            } catch (Exception e) {
                sendError("Ошибка сервера: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    private static Map<String, String> getFcgiParams() {
        Map<String, String> env = new HashMap<>();
        Properties properties = System.getProperties();

        for (String key : properties.stringPropertyNames()) {
            env.put(key, properties.getProperty(key));
        }
        return env;
    }

}
