package org.example;

import java.math.BigDecimal;
import java.util.List;

public record ValidationResult(BigDecimal x, BigDecimal y, BigDecimal r, List<Warning> warnings) {
}