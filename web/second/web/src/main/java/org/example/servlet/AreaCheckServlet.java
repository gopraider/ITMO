package org.example.servlet;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.model.AreaChecker;
import org.example.model.Number;
import org.example.util.Validation;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@WebServlet("/check")
public class AreaCheckServlet extends HttpServlet {

    private static String now() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        handle(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        handle(req, resp);
    }

    private void handle(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        req.setCharacterEncoding("UTF-8");
        resp.setCharacterEncoding("UTF-8");

        final String xStr = opt(req.getParameter("x"));
        final String rStr = opt(req.getParameter("r"));
        final String[] yArr = req.getParameterValues("y"); // чекбоксы → массив

        if (isBlank(xStr) || isBlank(rStr) || yArr == null || yArr.length == 0) {
            req.setAttribute("error", "Укажите X, выберите хотя бы одно значение Y и R.");
            req.getRequestDispatcher("/index.jsp").forward(req, resp);
            return;
        }

        String prelim = Validation.validateAll(xStr, yArr[0], rStr);
        if (prelim != null) {
            req.setAttribute("error", prelim);
            req.getRequestDispatcher("/index.jsp").forward(req, resp);
            return;
        }

        BigDecimal bx = Validation.parseDecimal(xStr);
        BigDecimal br = Validation.parseDecimal(rStr);

        ServletContext app = getServletContext();
        List<Map<String, String>> history;
        synchronized (app) {
            @SuppressWarnings("unchecked")
            List<Map<String, String>> existing = (List<Map<String, String>>) app.getAttribute("results");
            if (existing == null) {
                existing = new ArrayList<>();
                app.setAttribute("results", existing);
            }
            history = existing;
        }

        List<Number> points = new ArrayList<>();

        for (String yRaw : yArr) {
            String yStr = opt(yRaw);

            String err = Validation.validateAll(xStr, yStr, rStr);
            if (err != null) {
                req.setAttribute("error", err);
                req.getRequestDispatcher("/index.jsp").forward(req, resp);
                return;
            }

            BigDecimal by = Validation.parseDecimal(yStr);

            long start = System.nanoTime();
            boolean hit = AreaChecker.calculate(bx.doubleValue(), by.doubleValue(), br.doubleValue());
            long execMicros = (System.nanoTime() - start) / 1_000;

            Number point = new Number(bx.doubleValue(), by.doubleValue(), br.doubleValue(), hit);
            points.add(point);

            Map<String, String> row = new LinkedHashMap<>();
            row.put("time", now());
            row.put("x", stripZeros(bx));
            row.put("y", stripZeros(by));
            row.put("r", stripZeros(br));
            row.put("result", hit ? "Попадание" : "Промах");
            row.put("execTime", execMicros + " μs");

            synchronized (app) {
                history.add(0, row);
            }
        }


        req.getRequestDispatcher("/index.jsp").forward(req, resp);
    }

    private static String opt(String s) {
        return s == null ? "" : s.trim();
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static String stripZeros(BigDecimal v) {
        return v.stripTrailingZeros().toPlainString();
    }
}
