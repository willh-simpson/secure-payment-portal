package com.wills.payments.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentConfirmRequest(
        @NotBlank(message = "Multi-Factor Authentication code must be provided when required")
        String mfaToken
) {
}
