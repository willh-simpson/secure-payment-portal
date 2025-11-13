package com.wills.payments.application.service;

import com.wills.payments.application.exception.MfaException;
import com.wills.payments.application.exception.PaymentException;
import com.wills.payments.application.mapping.PaymentMapper;
import com.wills.payments.domain.dto.PaymentCreate;
import com.wills.payments.domain.dto.PaymentResponse;
import com.wills.payments.domain.model.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PaymentService {
    private final Map<String, Payment> store = new ConcurrentHashMap<>(); // dummy repo while database hasn't been created

    @Autowired
    private MfaService mfaService;

    public PaymentResponse create(PaymentCreate req) {
        try {
            Payment payment = PaymentMapper.toPayment(req);

            // determine if MFA is required
            boolean requiresMfa = payment.getAmount() > Payment.MFA_THRESHOLD;
            String mfaSecret = null;

            if (requiresMfa) {
                mfaSecret = mfaService.generateSecret();
            } else {
                payment.confirm();
            }

            payment.setMfaSecret(mfaSecret);
            store.put(payment.getId(), payment);

            return PaymentMapper.toResponse(payment, requiresMfa);
        } catch (Exception e) {
            throw new PaymentException("Failed to create payment: " + e.getMessage());
        }
    }

    public Payment getById(String id) {
        return store.get(id);
    }

    public PaymentResponse confirm(String id, String mfaCode) {
        Payment payment = getById(id);

        if (payment == null)
            throw new PaymentException("Payment not found");

        // check if MFA is required
        boolean requiresMfa = payment.getAmount() > Payment.MFA_THRESHOLD;
        if (requiresMfa) {
            if (mfaCode == null || mfaCode.isEmpty()) {
                throw new MfaException("Multi-Factor Authentication required");
            }

            if (!mfaService.verifyCode(payment.getMfaSecret(), mfaCode)) {
                throw new MfaException("Invalid code");
            }
        }

        payment.confirm();

        return PaymentMapper.toResponse(payment, requiresMfa);
    }
}
