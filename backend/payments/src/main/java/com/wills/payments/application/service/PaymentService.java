package com.wills.payments.application.service;

import com.wills.payments.application.exception.MfaException;
import com.wills.payments.application.exception.PaymentException;
import com.wills.payments.application.mapping.PaymentMapper;
import com.wills.payments.domain.dto.PaymentCreate;
import com.wills.payments.domain.dto.PaymentResponse;
import com.wills.payments.domain.model.Payment;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PaymentService {
    private final Map<String, Payment> store = new ConcurrentHashMap<>(); // dummy repo while database hasn't been created

    public PaymentResponse create(PaymentCreate req) {
        try {
            Payment payment = new Payment(
                    req.fromAccount(),
                    req.toAccount(),
                    Double.parseDouble(req.amount()),
                    req.currency(),
                    req.memo()
            );

            // determine if MFA is required
            boolean requiresMfa = payment.getAmount() > Payment.MFA_THRESHOLD;
            String mfaToken = requiresMfa ? generateMfaToken() : null;

            store.put(payment.getId(), payment);

            return PaymentMapper.toResponse(payment, requiresMfa, mfaToken);
        } catch (Exception e) {
            return null;
        }
    }

    public Payment getById(String id) {
        return store.get(id);
    }

    public PaymentResponse confirm(String id, String mfaToken) {
        Payment payment = getById(id);
        if (payment == null)
            throw new PaymentException("Payment not found");

        // check if MFA is required
        boolean requiresMfa = payment.getAmount() > Payment.MFA_THRESHOLD;
        if (requiresMfa && (mfaToken == null || mfaToken.isEmpty())) {
            throw new MfaException("Multi-Factor Authentication required");

            // TODO: authenticate mfaToken properly. for demo accept anything non-empty
        }

        payment.confirm();

        return PaymentMapper.toResponse(payment, requiresMfa, mfaToken);
    }

    /**
     * simple MFA token generator for demo. this should be refactored later for proper generation
     * @return 6-character string in uppercase
     */
    private String generateMfaToken() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
