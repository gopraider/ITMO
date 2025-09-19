package org.example;

import com.fastcgi.FCGIInterface;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import static org.example.Numbers.*;
import static org.example.Requester.*;

@SuppressWarnings("checkstyle:RegexpMultiline")
public class Main {

    private static final String JSON_FILE_PATH =
            System.getenv().getOrDefault("JSON_FILE_PATH", "data.json");

    public static void main(String[] args) {
        FCGIInterface fcgi = new FCGIInterface();

        DumpManager dumpManager;
        try {
            dumpManager = new DumpManager(JSON_FILE_PATH);
        } catch (Exception initEx) {
            System.err.println("Не удалось инициализировать DumpManager: " + initEx);
            initEx.printStackTrace(System.err);
            return;
        }

        System.out.println("Сервер запущен, JSON: " + java.nio.file.Paths.get(JSON_FILE_PATH).toAbsolutePath());

        while (fcgi.FCGIaccept() >= 0) {
            try {
                Map<String, String> env = getFcgiParams();

                String method = env.getOrDefault("REQUEST_METHOD", "");
                if (!"GET".equalsIgnoreCase(method)) {
                    sendMethodNotAllowed();
                    continue;
                }

                String queryString = env.get("QUERY_STRING");
                Map<String, List<String>> params = parseQueryString(queryString == null ? "" : queryString);

                if (params.containsKey("init")) {
                    sendJson(dumpManager.readAllAsJson());
                    continue;
                }

                if (queryString == null || queryString.isBlank()) {
                    sendBadRequest("QUERY_STRING пустой или отсутствует");
                    continue;
                }

                ValidationResult vr = validateAll(params);
                if (!vr.warnings().isEmpty()) {
                    sendValidationProblem(vr.warnings());
                    continue;
                }


                long t0 = System.nanoTime();
                boolean calc = calculate(vr.x(), vr.y(), vr.r());

                long t1 = System.nanoTime();

                long execMs = t1 - t0;
                Result res = new Result(
                        LocalDateTime.now(),
                        vr.x(), vr.y(), vr.r(),
                        calc,
                        execMs
                );
                try {
                    dumpManager.appendToFile(res);
                } catch (Exception ioErr) {
                    System.err.println("Не удалось записать результат: " + ioErr);
                }

                sendMessage(execMs, calc);

            } catch (Exception e) {
                sendError("Ошибка сервера: " +
                        (e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage()));
                e.printStackTrace(System.err);
            }
        }
    }

    private static Map<String, String> getFcgiParams() {
        Map<String, String> m = new HashMap<>();
        try {
            System.getenv().forEach((k, v) -> {
                if (k != null && v != null) m.put(k, v);
            });
        } catch (Exception e) {
            e.printStackTrace(System.err);
        }
        try {
            Properties p = System.getProperties();
            for (String name : p.stringPropertyNames()) {
                String val = p.getProperty(name);
                if (name != null && val != null && !m.containsKey(name)) m.put(name, val);
            }
        } catch (Exception e) {
            e.printStackTrace(System.err);
        }
        return m;
    }
}
