package com.wills.payments.domain.model;

import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

public class Payment {
    private final String id;
    private final String fromAccount;
    private final String toAccount;
    private final double amount;
    private final String currency;
    @Setter
    private PaymentStatus status;
    private final LocalDateTime createdAt;
    @Setter
    private String memo;

    public static final double MFA_THRESHOLD = 1000.0;

    public Payment(String fromAccount, String toAccount, double amount, String currency, String memo) {
        this.id = UUID.randomUUID().toString();
        this.fromAccount = fromAccount;
        this.toAccount = toAccount;
        this.amount = amount;
        this.currency = currency;
        this.status = PaymentStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.memo = memo;
    }

    public PaymentStatus confirm() {
        if (this.status != PaymentStatus.PENDING) {
            throw new IllegalStateException("Payment cannot be confirmed unless it is PENDING");
        }

        return this.status = PaymentStatus.CONFIRMED;
    }

    public String getId() {
        return id;
    }

    public String getFromAccount() {
        return fromAccount;
    }

    public String getToAccount() {
        return toAccount;
    }

    public double getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getMemo() {
        return memo;
    }
}
