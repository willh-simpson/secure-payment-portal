package com.wills.payments.api.controller;

import com.wills.payments.application.exception.MfaException;
import com.wills.payments.application.exception.PaymentException;
import com.wills.payments.application.service.PaymentService;
import com.wills.payments.domain.dto.PaymentConfirmRequest;
import com.wills.payments.domain.dto.PaymentCreate;
import com.wills.payments.domain.dto.PaymentErrorResponse;
import com.wills.payments.domain.dto.PaymentResponse;
import com.wills.payments.domain.model.Payment;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
public class PaymentController {
    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping("/payments")
    public ResponseEntity<PaymentResponse> create(@Validated @RequestBody PaymentCreate req) {
        PaymentResponse res = service.create(req);

        return ResponseEntity.status(res.requiresMfa() ? 202 : 201)
                .body(res);
    }

    @PutMapping("/payments/{id}/confirm")
    public ResponseEntity<?> confirm(@PathVariable String id, @RequestBody(required = false) PaymentConfirmRequest req) {
        String mfaToken = req != null ? req.mfaCode() : null;

        try {
            PaymentResponse res = service.confirm(id, mfaToken);

            return ResponseEntity.ok(res);
        } catch (PaymentException e) {
            return ResponseEntity.status(404).body(new PaymentErrorResponse(e.getMessage()));
        } catch (MfaException e) {
            return ResponseEntity.status(401).body(new PaymentErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/payments/{id}")
    public ResponseEntity<Payment> getById(@PathVariable String id) {
        Payment res = service.getById(id);

        if (res == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(res);
    }
}
