<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!doctype html>
<html lang="ru">
<head>
    <title>Результаты</title>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/style.css">
</head>
<body>
<h1>Результаты вычислений</h1>

<div class="table-container">
    <table class="results-table">
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
        <c:forEach var="row" items="${applicationScope.results}">
            <tr>
                <td><c:out value="${row.time}"/></td>
                <td><c:out value="${row.x}"/></td>
                <td><c:out value="${row.y}"/></td>
                <td><c:out value="${row.r}"/></td>
                <td><c:out value="${row.result}"/></td>
                <td><c:out value="${row.execTime}"/></td>
            </tr>
        </c:forEach>
        </tbody>
    </table>
</div>

<p style="margin-top: 16px;">
    <a class="btn" href="${pageContext.request.contextPath}/index.jsp">← Назад</a>
</p>
</body>
</html>
