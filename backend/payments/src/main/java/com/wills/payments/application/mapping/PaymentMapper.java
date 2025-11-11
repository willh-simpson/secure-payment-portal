package com.wills.payments.application.mapping;

import com.wills.payments.domain.dto.PaymentCreate;
import com.wills.payments.domain.dto.PaymentResponse;
import com.wills.payments.domain.model.Payment;

public class PaymentMapper {
    public static Payment toPayment(PaymentCreate dto) {
        return new Payment(
                dto.fromAccount(),
                dto.toAccount(),
                Double.parseDouble(dto.amount()),
                dto.currency(),
                dto.memo()
        );
    }

    public static PaymentResponse toResponse(Payment payment, boolean requiresMfa, String mfaToken) {
        return new PaymentResponse(
                payment.getId(),
                payment.getStatus(),
                String.valueOf(payment.getAmount()),
                payment.getCurrency(),
                payment.getCreatedAt().toString(),
                requiresMfa,
                mfaToken
        );
    }
}
