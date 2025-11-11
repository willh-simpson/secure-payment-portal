package com.wills.payments.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PaymentCreate(
        String idempotencyKey,
        @NotBlank
        String fromAccount,
        @NotBlank
        String toAccount,
        @NotBlank
        @Pattern(regexp = "^[0-9]+(\\.[0-9]{1,2})?$")
        String amount,
        @NotBlank
        String currency,
        String memo
) {
}
