package com.wills.payments.domain.dto;

import com.wills.payments.domain.model.PaymentStatus;

public record PaymentResponse(
        String id,
        PaymentStatus status,
        String amount,
        String currency,
        String createdAt,
        boolean requiresMfa
) {
}
