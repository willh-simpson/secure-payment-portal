package com.wills.payments.application.exception;

public class MfaException extends RuntimeException {
    public MfaException(String message) {
        super(message);
    }
}
