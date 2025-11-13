package com.wills.payments.unit.service;

import com.wills.payments.application.service.MfaService;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.exceptions.CodeGenerationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class MfaServiceTest {
    private MfaService service;
    private CodeGenerator generator;
    private String secret;

    @BeforeEach
    void setUp() {
        service = new MfaService();
        generator = new DefaultCodeGenerator();
        secret = "JBSWY3DPEHPK3PXP";
    }

    @Test
    void generateCode_success() {
        String generatedSecret = service.generateSecret();

        assertNotNull(generatedSecret);
    }

    @Test
    void verifyCode_success() throws CodeGenerationException {
        // generate a valid code for current timestamp
        long currentTime = System.currentTimeMillis() / 1000L;
        String code = generator.generate(secret, currentTime / 30);

        boolean result = service.verifyCode(secret, code);

        assertTrue(result);
    }

    @Test
    void verifyCode_failure() {
        boolean result = service.verifyCode(secret, "invalid-code");

        assertFalse(result);
    }
}
