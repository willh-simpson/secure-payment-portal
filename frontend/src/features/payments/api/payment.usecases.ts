import type { PaymentsRepository } from '../../../repositories/payments.repository';
import type { Payment } from '../model/payment.entity';
import type { Result } from '../../../shared/types/result';
import { Results } from '../../../shared/types/result';

export const createPaymentUseCase = (repo: PaymentsRepository) => {
    return async (input: {
        fromAccount: string;
        toAccount: string;
        amount: number;
        currency: 'USD'; // add support for more currencies later
        memo?: string;
        idempotencyKey?: string;
    }): Promise<
        Result<{
            payment: Payment;
            requiresMfa?: boolean;
            mfaToken?: string;
        }>
    > => {
        if (input.fromAccount === input.toAccount) {
            return Results.fail('Cannot transfer to the same account');
        }

        if (input.amount <= 0) {
            return Results.fail('Amount must be greater than 0');
        }

        // add other validation rules here (account format, max amount, etc)

        const result = await repo.create({
            fromAccount: input.fromAccount,
            toAccount: input.toAccount,
            amount: input.amount,
            currency: input.currency,
            memo: input.memo,
            idempotencyKey: input.idempotencyKey,
        });

        if (Results.isError(result)) {
            return Results.fail(result.error);
        }

        return Results.ok(result.data);
    };
};

export const confirmPaymentUseCase = (repo: PaymentsRepository) => {
    return async (paymentId: string, mfaCode: string) => {
        if (!mfaCode) {
            return Results.fail('MFA code required');
        }

        const result = await repo.confirm(paymentId, mfaCode);

        if (Results.isError(result)) {
            return Results.fail(result.error);
        }

        return Results.ok(result.data);
    };
};

// for demo purposes only
export const getSecret = (repo: PaymentsRepository) => {
    return async (paymentId: string) => {
        const result = await repo.getSecret(paymentId);

        if (Results.isError(result)) {
            return Results.fail(result.error);
        }

        return Results.ok(result.data);
    };
};
