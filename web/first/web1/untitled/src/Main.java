import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    public static void main(String[] args) {
        String bim = "/calculate?x=2&y=-2&r=2";
        System.out.println(validateParameters(parseNumbers(bim)));
    }
    private static Map<String, String> parseNumbers(String query) {
        int questionMarkIndex = query.indexOf('?');
        if (questionMarkIndex >= 0) {
            query = query.substring(questionMarkIndex + 1);
        }

        // Теперь парсим чистую строку вида: "x=2&y=-2&r=2"
        return Arrays.stream(query.split("&"))
                .map(pair -> pair.split("=", 2))
                .filter(keyValue -> keyValue.length == 2)
                .collect(Collectors.toMap(
                        keyValue -> URLDecoder.decode(keyValue[0], StandardCharsets.UTF_8),
                        keyValue -> URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8),
                        (existing, replacement) -> replacement, // если дубликат — берём последнее
                        LinkedHashMap::new
                ));
    }

    public static boolean validateParameters(Map<String, String> params) {
        List<String> errors = new ArrayList<>();

        // Проверка X
        if (!params.containsKey("x")) {
            errors.add("Параметр X обязателен");
        } else {
            String xStr = params.get("x").trim();
            if (xStr.isEmpty()) {
                errors.add("X не может быть пустым");
            } else {
                try {
                    double x = Double.parseDouble(xStr);
                    if (x < -5 || x > 3) {
                        errors.add("X должен быть в диапазоне от -5 до 3");
                    }
                } catch (NumberFormatException e) {
                    errors.add("X должен быть числом");
                }
            }
        }

        // Проверка Y (одно значение, как в JS)
        if (!params.containsKey("y")) {
            errors.add("Параметр Y обязателен");
        } else {
            String yStr = params.get("y").trim();
            if (yStr.isEmpty()) {
                errors.add("Y не может быть пустым");
            } else {
                try {
                    double y = Double.parseDouble(yStr);
                    if (y < -3 || y > 5) {
                        errors.add("Y должен быть в диапазоне от -3 до 5");
                    }
                } catch (NumberFormatException e) {
                    errors.add("Y должен быть числом");
                }
            }
        }

        // Проверка R
        if (!params.containsKey("r")) {
            errors.add("Параметр R обязателен");
        } else {
            String rStr = params.get("r").trim();
            if (rStr.isEmpty()) {
                errors.add("R не может быть пустым");
            } else {
                try {
                    int r = Integer.parseInt(rStr);
                    if (r < 1 || r > 5) {
                        errors.add("R должен быть целым числом от 1 до 5");
                    }
                } catch (NumberFormatException e) {
                    errors.add("R должен быть числом");
                }
            }
        }

        // Если есть ошибки — печатаем и возвращаем false
        if (!errors.isEmpty()) {
            System.out.println("Ошибки валидации: " + String.join("; ", errors));
            return false;
        }

        // Если ошибок нет — всё ок
        return true;
    }

}