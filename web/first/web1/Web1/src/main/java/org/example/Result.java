package org.example;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record Result(LocalDateTime createdAt, BigDecimal x, BigDecimal y, BigDecimal r, boolean result, long execMs) {
}
