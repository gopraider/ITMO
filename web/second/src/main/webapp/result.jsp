<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!doctype html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Результаты проверки точки</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/result.css">
</head>
<body>

<div class="results-container">
    <h1>Результаты вычислений</h1>

    <div class="table-wrapper">
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
                <tr class="${row.result eq 'Попадание' ? 'hit' : 'miss'}">
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

    <div class="back-link">
        <a href="${pageContext.request.contextPath}/index.jsp">← Назад</a>
    </div>
</div>

</body>
</html>
