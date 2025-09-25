<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ page import="java.util.Map" %>
<!doctype html>
<html lang="ru">
<head>
    <meta charset="UTF-8"/>
    <title>Результат проверки</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/style.css"/>
</head>
<body>
<%
    @SuppressWarnings("unchecked")
    Map<String, Object> resMap = (Map<String, Object>) request.getAttribute("result");
    if (resMap == null) {
        resMap = (Map<String, Object>) request.getAttribute("resultMap");
    }

    Object xObj   = (resMap != null ? resMap.get("x")   : request.getAttribute("x"));
    Object yObj   = (resMap != null ? resMap.get("y")   : request.getAttribute("y"));
    Object rObj   = (resMap != null ? resMap.get("r")   : request.getAttribute("r"));
    Object hitObj = (resMap != null ? resMap.get("hit") : request.getAttribute("hit"));
    Object tObj   = (resMap != null ? resMap.get("time"): request.getAttribute("time"));
    Object exObj  = (resMap != null ? resMap.get("execTime") : request.getAttribute("execTime"));

    String x = xObj != null ? String.valueOf(xObj) : "";
    String y = yObj != null ? String.valueOf(yObj) : "";
    String r = rObj != null ? String.valueOf(rObj) : "";
    String time = tObj != null ? String.valueOf(tObj) : "";
    String execTime = exObj != null ? String.valueOf(exObj) : "";

    boolean hit = false;
    if (hitObj instanceof Boolean) {
        hit = (Boolean) hitObj;
    } else if (hitObj != null) {
        hit = "true".equalsIgnoreCase(String.valueOf(hitObj)) ||
              "да".equalsIgnoreCase(String.valueOf(hitObj));
    }
%>

<main class="card centered" style="max-width:900px;margin:32px auto;">
    <h2 style="margin-top:0;">Результат проверки</h2>

    <table class="results-table" style="width:100%;border-collapse:collapse;">
        <thead>
        <tr>
            <th>Время запроса</th>
            <th>X</th>
            <th>Y</th>
            <th>R</th>
            <th>Результат</th>
            <th>Время выполнения</th>
        </tr>
        </thead>
        <tbody>
        <tr class="<%= hit ? "hit" : "miss" %>">
            <td><%= time %></td>
            <td><%= x %></td>
            <td><%= y %></td>
            <td><%= r %></td>
            <td><%= hit ? "Попадание" : "Промах" %></td>
            <td><%= execTime != null ? execTime : "" %></td>
        </tr>
        </tbody>
    </table>

    <div style="margin-top:16px;">
        <a class="button" href="<%= request.getContextPath() %>/controller">Новый запрос</a>
    </div>
</main>

</body>
</html>
