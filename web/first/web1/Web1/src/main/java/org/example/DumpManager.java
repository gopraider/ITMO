package org.example;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.format.DateTimeFormatter;

public class DumpManager {
    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy, HH:mm:ss");

    private final Path jsonFilePath;

    public DumpManager(String filePath) throws IOException {
        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException("Путь к файлу JSON не может быть пустым или null");
        }

        this.jsonFilePath = Paths.get(filePath);

        Path parent = jsonFilePath.getParent();
        if (parent != null && !Files.exists(parent)) {
            Files.createDirectories(parent);
        }

        if (!Files.exists(jsonFilePath)) {
            Files.writeString(jsonFilePath, "[]", StandardOpenOption.CREATE_NEW);
        }
    }

    private String resultToJson(Result r) {
        if (r == null) {
            throw new IllegalArgumentException("Result не может быть null");
        }

        return String.format(
                "{" +
                        "\"createdAt\":\"%s\"," +
                        "\"x\":%s," +
                        "\"y\":%s," +
                        "\"r\":%s," +
                        "\"result\":%s," +
                        "\"execMs\":%d" +
                        "}",
                r.createdAt().format(DATE_FORMAT),
                r.x().toPlainString(),
                r.y().toPlainString(),
                r.r().toPlainString(),
                r.result(),
                r.execMs()
        );
    }

    public synchronized void appendToFile(Result r) throws IOException {
        String content = Files.readString(jsonFilePath).trim();
        if (!content.endsWith("]")) {
            Files.writeString(jsonFilePath, "[\n" + resultToJson(r) + "\n]",
                    StandardOpenOption.TRUNCATE_EXISTING);
            return;
        }

        String head = content.substring(0, content.length() - 1).trim();

        String updated = head.endsWith("[")
                ? head + "\n" + resultToJson(r) + "\n]"
                : head + ",\n" + resultToJson(r) + "\n]";

        Files.writeString(jsonFilePath, updated, StandardOpenOption.TRUNCATE_EXISTING);
    }

    public synchronized String readAllAsJson() throws IOException {
        if (!Files.exists(jsonFilePath)) {
            return "[]";
        }
        String s = Files.readString(jsonFilePath).trim();
        return (!s.startsWith("[") || !s.endsWith("]")) ? "[]" : s;
    }
}
