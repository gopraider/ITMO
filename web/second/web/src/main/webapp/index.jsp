<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!doctype html>
<html lang="ru">
<head>
    <title>Пора на фронт</title>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/style.css">
    <script defer src="${pageContext.request.contextPath}/main.js"></script>
</head>
<body>
<nav class="description">
    <div class="info-container">
        <a href="https://se.ifmo.ru/" target="_blank" class="image-link">
            <img src="${pageContext.request.contextPath}/images/duck.png" alt="duck" class="duck">
        </a>
        <div id="Information">
            Калакин Ярослав Евгеньевич
            <br/>P3209
            <br/>ИСУ/Вариант: 466084
        </div>
        <a href="https://github.com/gopraider" target="_blank" class="image-link">
            <img src="${pageContext.request.contextPath}/images/GitHub.png" alt="GHimage" class="GHimage">
        </a>
    </div>
    <div class="quote-container">
        <blockquote class="nice-quote">
            "Вы че, дурные? Другой реакции кроме "суицида" на неуспех изобразить не можете? Нормальная реакция на провал - сжать (разные места) и бороться =). Тряпки."
        </blockquote>
        <cite class="quote-author">@Клименков С.В.</cite>
    </div>
</nav>

<div class="work-container">
    <form method="post" action="${pageContext.request.contextPath}/controller" id="area-form">
        <div class="input-group X">
            <h3>Введите X:</h3>
            <input
                    type="number"
                    id="x-input"
                    name="x"
                    placeholder="от -3 до 3"
                    step="0.5"
                    min="-3"
                    max="3"
                    required
            />
        </div>

        <div class="checkbox-group Y">
            <h3>Выберите Y (можно несколько):</h3>
            <label class="checkbox-item"><input type="checkbox" name="y" value="-3"> -3</label>
            <label class="checkbox-item"><input type="checkbox" name="y" value="-2"> -2</label>
            <label class="checkbox-item"><input type="checkbox" name="y" value="-1"> -1</label>
            <label class="checkbox-item"><input type="checkbox" name="y" value="0"> 0</label>
            <label class="checkbox-item"><input type="checkbox" name="y" value="1"> 1</label>
            <label class="checkbox-item"><input type="checkbox" name="y" value="2"> 2</label>
            <label class="checkbox-item"><input type="checkbox" name="y" value="3"> 3</label>
            <label class="checkbox-item"><input type="checkbox" name="y" value="4"> 4</label>
            <label class="checkbox-item"><input type="checkbox" name="y" value="5"> 5</label>
        </div>

        <div class="Button-group R">
            <h3>Выберите R</h3>
            <label class="radio-item"><input type="radio" name="r" value="1"   required> 1</label>
            <label class="radio-item"><input type="radio" name="r" value="1.5"> 1.5</label>
            <label class="radio-item"><input type="radio" name="r" value="2">   2</label>
            <label class="radio-item"><input type="radio" name="r" value="2.5"> 2.5</label>
            <label class="radio-item"><input type="radio" name="r" value="3">   3</label>
        </div>

        <div class="graph-container">
            <canvas id="graph" width="400" height="400"></canvas>
        </div>

        <div id="error-message">
            <c:if test="${not empty requestScope.error}">
                <span class="error"><c:out value="${requestScope.error}"/></span>
            </c:if>
        </div>

        <button type="submit" class="submit">Отправить</button>
    </form>
</div>

<section class="results-section">
    <h2>Результаты вычислений</h2>
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
</section>

</body>
</html>
