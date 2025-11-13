package com.wills.payments.application.service;

import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import org.springframework.stereotype.Service;

@Service
public class MfaService {
    private final CodeVerifier verifier;
    private final SecretGenerator secretGenerator;

    public MfaService() {
        this.verifier = new DefaultCodeVerifier(
                new DefaultCodeGenerator(),
                new SystemTimeProvider()
        );
        this.secretGenerator = new DefaultSecretGenerator();
    }

    public boolean verifyCode(String secret, String code) {
        return verifier.isValidCode(secret, code);
    }

    public String generateSecret() {
        return secretGenerator.generate();
    }
}
