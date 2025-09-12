package org.example;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class Requester {
    private static final String RESULT_JSON = """
            {
                "time": "%s",
                "now": "%s",
                "result": %b
            }
            """;

    private static final String ERROR_JSON = """
            {
                "now": "%s",
                "reason": "%s"
            }
            """;
    public static void SendMessage(Instant startTime, Instant endTime, boolean result) {
        String json = String.format(
                RESULT_JSON,
                ChronoUnit.NANOS.between(startTime, endTime),
                LocalDateTime.now(),
                result
        );

        String response = String.format("""
                        Status: 200 OK
                        Content-Type: application/json

                        %s
                        """, json);

        System.out.println(response);

    }
    public static void sendError(String reason) {
        String json = String.format(ERROR_JSON, LocalDateTime.now(), reason);
        String response = String.format("""
                Status: 400 Bad Request
                Content-Type: application/json

                %s
                """, json);
        System.out.println(response);
    }
}
