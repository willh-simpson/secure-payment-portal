package com.wills.payments.api.controller;

import com.wills.payments.application.service.PaymentService;
import com.wills.payments.domain.dto.PaymentCreate;
import com.wills.payments.domain.dto.PaymentResponse;
import com.wills.payments.domain.model.Payment;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
//@RequestMapping("/api")
public class PaymentController {
    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping("/payments")
    public ResponseEntity<PaymentResponse> create(@Validated @RequestBody PaymentCreate req) {
        PaymentResponse res = service.create(req);

        return ResponseEntity.status(res.requiresMfa() ? 202: 201)
                .body(res);
    }

    @PutMapping("/payments/{id}/confirm")
    public ResponseEntity<PaymentResponse> confirm(@PathVariable String id, @RequestBody Map<String, String> body) {
        String mfaToken = body.get("mfaToken");

        try {
            PaymentResponse res = service.confirm(id, mfaToken);

            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
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
