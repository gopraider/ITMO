package org.example;

import java.util.List;

@SuppressWarnings({"PMD.SystemPrintln", "checkstyle:RegexpMultiline"})
public class Requester {

    private static final String CT_PROBLEM = "Content-Type: application/problem+json; charset=utf-8";
    private static final String CT_JSON = "Content-Type: application/json; charset=utf-8";
    private static final String SEP = "";

    public static void sendValidationProblem(List<Warning> warnings) {
        System.out.println("Status: 400 Bad Request");
        System.out.println(CT_PROBLEM);
        System.out.println(SEP);
        StringBuilder sb = new StringBuilder();
        sb.append("{")
                .append("\"type\":\"https://example.com/probs/validation-error\",")
                .append("\"title\":\"Ошибка валидации входных данных\",")
                .append("\"status\":400,")
                .append("\"detail\":\"Найдены ошибки валидации. Исправьте и повторите запрос.\",")
                .append("\"warnings\":[");
        for (int i = 0; i < warnings.size(); i++) {
            Warning w = warnings.get(i);
            if (i > 0) sb.append(',');
            sb.append("{\"field\":\"").append(jsonEscape(w.field()))
                    .append("\",\"message\":\"").append(jsonEscape(w.message())).append("\"}");
        }
        sb.append("]}");
        System.out.print(sb);
    }

    public static void sendBadRequest(String detail) {
        System.out.println("Status: 400 Bad Request");
        System.out.println(CT_PROBLEM);
        System.out.println(SEP);
        System.out.print("{\"type\":\"about:blank\",\"title\":\"Некорректный запрос\",\"status\":400,\"detail\":\""
                + jsonEscape(detail) + "\"}");
    }

    public static void sendMethodNotAllowed() {
        System.out.println("Status: 405 Method Not Allowed");
        System.out.println(CT_PROBLEM);
        System.out.println("Allow: GET");
        System.out.println(SEP);
        System.out.print("{\"type\":\"about:blank\",\"title\":\"Метод не разрешён\",\"status\":405,\"detail\":\"Используйте только GET\"}");
    }

    public static void sendError(String detail) {
        System.out.println("Status: 500 Internal Server Error");
        System.out.println(CT_PROBLEM);
        System.out.println(SEP);
        System.out.print("{\"type\":\"about:blank\",\"title\":\"Внутренняя ошибка сервера\",\"status\":500,\"detail\":\""
                + jsonEscape(detail) + "\"}");
    }

    public static void sendMessage(long execMs, boolean hit) {
        System.out.println("Status: 200 OK");
        System.out.println(CT_JSON);
        System.out.println(SEP);
        System.out.print("{\"hit\":" + hit + ",\"executionTime\":" + execMs + "}");
    }

    public static void sendJson(String json) {
        System.out.println("Content-Type: application/json\r\n");
        System.out.println(json);
    }

    private static String jsonEscape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
