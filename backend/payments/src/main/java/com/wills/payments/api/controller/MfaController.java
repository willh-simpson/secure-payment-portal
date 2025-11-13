package com.wills.payments.api.controller;

import com.wills.payments.application.exception.PaymentException;
import com.wills.payments.application.service.MfaService;
import com.wills.payments.application.service.PaymentService;
import com.wills.payments.domain.model.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/mfa")
public class MfaController {
    @Autowired
    private MfaService mfaService;
    @Autowired
    private PaymentService paymentService;

    @GetMapping("/secret")
    public Map<String, String> generateSecret() {
        return Map.of("secret", mfaService.generateSecret());
    }

    // temporary while in demo
    @GetMapping("/secret/{paymentId}")
    public ResponseEntity<Map<String, String>> getSecret(@PathVariable String paymentId) {
        Payment payment = paymentService.getById(paymentId);
        if (payment == null) {
            throw new PaymentException("Payment not found");
        }

        Map<String, String> res = new HashMap<>();
        res.put("secret", payment.getMfaSecret());

        return ResponseEntity.ok(res);
    }
}
