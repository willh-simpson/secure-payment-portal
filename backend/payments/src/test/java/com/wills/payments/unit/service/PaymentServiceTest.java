package com.wills.payments.unit.service;

import com.wills.payments.application.exception.MfaException;
import com.wills.payments.application.service.PaymentService;
import com.wills.payments.domain.dto.PaymentCreate;
import com.wills.payments.domain.dto.PaymentResponse;
import com.wills.payments.domain.model.Payment;
import com.wills.payments.domain.model.PaymentStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {
    private PaymentService service;

    @BeforeEach
    void setUp() {
        service = new PaymentService();
    }

    @Test
    void create_success() {
        PaymentCreate req = new PaymentCreate(
                null,
                "111",
                "222",
                "100",
                "USD",
                null
        );

        PaymentResponse res = service.create(req);

        assertEquals(PaymentStatus.PENDING, res.status());
        assertFalse(res.requiresMfa());
    }

    @Test
    void create_success_requiresMfa() {
        PaymentCreate req = new PaymentCreate(
                null,
                "111",
                "222",
                "1500",
                "USD",
                null
        );

        PaymentResponse res = service.create(req);

        assertTrue(res.requiresMfa());
        assertNotNull(res.mfaToken());
    }

    @Test
    void getById_success() {
        PaymentCreate stored = new PaymentCreate(
                null,
                "111",
                "222",
                "100",
                "USD",
                null
        );

        PaymentResponse res = service.create(stored);
        Payment payment = service.getById(res.id());

        assertEquals(payment.getId(), res.id());
    }

    @Test
    void getById_failure() {
        assertNull(service.getById("nonexistent-id"));
    }

    @Test
    void confirm_success_mfaNotRequired() {
        PaymentCreate req = new PaymentCreate(
                null,
                "111",
                "222",
                "100",
                "USD",
                null
        );

        PaymentResponse created = service.create(req);
        PaymentResponse confirmed = service.confirm(created.id(), null);

        assertEquals(PaymentStatus.CONFIRMED, confirmed.status());
    }

    @Test
    void confirm_success_mfaRequired() {
        PaymentCreate req = new PaymentCreate(
                null,
                "111",
                "222",
                "1500",
                "USD",
                null
        );

        PaymentResponse created = service.create(req);
        PaymentResponse confirmed = service.confirm(created.id(), "token"); // current service version only checks if mfaToken != null

        assertEquals(PaymentStatus.CONFIRMED, confirmed.status());
    }

    @Test
    void confirm_failure_mfaRequired() {
        PaymentCreate req = new PaymentCreate(
                null,
                "111",
                "222",
                "1500",
                "USD",
                null
        );

        PaymentResponse created = service.create(req);

        assertThrows(MfaException.class, () -> service.confirm(created.id(), null));
    }
}
