import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import { createPaymentUseCase } from '../../../../features/payments/api/payment.usecases';
import type { PaymentsRepository } from '../../../../repositories/payments.repository';
import type { Payment } from '../../../../features/payments/model/payment.entity';
import { Results } from '../../../../shared/types/result';

describe('createPaymentUseCase', () => {
    let mockRepo: jest.Mocked<PaymentsRepository>;

    beforeEach(() => {
        mockRepo = {
            create: jest.fn(),
            confirm: jest.fn(),
            getById: jest.fn(),
        } as jest.Mocked<PaymentsRepository>;
    });

    test('rejects payments with amount <= 0', async () => {
        mockRepo.create.mockResolvedValue({
            success: false,
            error: 'Repository failed',
        });

        const useCase = createPaymentUseCase(mockRepo);
        const result = await useCase({
            fromAccount: '111',
            toAccount: '222',
            amount: 0,
            currency: 'USD',
        });

        expect(result.success).toBe(false);
        if (Results.isError(result)) expect(result.error).toMatch(/greater than 0/);
        expect(mockRepo.create).not.toHaveBeenCalled();
    });

    test('rejects payments with same from/to account', async () => {
        mockRepo.create.mockResolvedValue({
            success: false,
            error: 'Repository failed',
        });

        const useCase = createPaymentUseCase(mockRepo);
        const result = await useCase({
            fromAccount: '111',
            toAccount: '111',
            amount: 100,
            currency: 'USD',
        });

        expect(result.success).toBe(false);
        if (Results.isError(result)) expect(result.error).toMatch(/same account/);
        expect(mockRepo.create).not.toHaveBeenCalled();
    });

    test('calls repository when input is valid', async () => {
        const payment: Payment = {
            id: 'p1',
            fromAccount: '111',
            toAccount: '222',
            amount: 100,
            currency: 'USD',
            status: 'pending',
        };

        mockRepo.create.mockResolvedValue({ success: true, data: { payment } });

        const useCase = createPaymentUseCase(mockRepo);
        const result = await useCase({
            fromAccount: '111',
            toAccount: '222',
            amount: 100,
            currency: 'USD',
        });

        expect(mockRepo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                fromAccount: '111',
                toAccount: '222',
                amount: 100,
                currency: 'USD',
            })
        );
        expect(result.success).toBe(true);
        if (Results.isOk(result)) expect(result.data.payment.id).toBe('p1');
    });

    test('handles repository failure', async () => {
        mockRepo.create.mockResolvedValue({
            success: false,
            error: 'Repository failed',
        });

        const useCase = createPaymentUseCase(mockRepo);
        const result = await useCase({
            fromAccount: '111',
            toAccount: '222',
            amount: 100,
            currency: 'USD',
        });

        expect(result.success).toBe(false);
        if (Results.isError(result)) expect(result.error).toBe('Repository failed');
    });
});
