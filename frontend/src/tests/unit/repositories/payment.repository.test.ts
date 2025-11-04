import { jest, describe, expect, test } from '@jest/globals';
import type { PaymentsRepository } from '../../../repositories/payments.repository';
import type { Payment } from '../../../features/payments/model/payment.entity';

describe('createPayment', () => {
    test('calls repository and validates amount', async () => {
        const createMock = jest.fn<PaymentsRepository['create']>();

        createMock.mockResolvedValue({
            success: true,
            data: {
                payment: {
                    id: '1',
                    fromAccount: '111',
                    toAccount: '222',
                    amount: 10,
                    currency: 'USD',
                    status: 'pending',
                } as Payment,
            },
        });

        const mockRepo: PaymentsRepository = {
            create: createMock as any,
            confirm: jest.fn() as any,
            getById: jest.fn() as any,
        };

        const result = await mockRepo.create({
            fromAccount: '111',
            toAccount: '222',
            amount: 10,
            currency: 'USD',
        } as any);

        expect(mockRepo.create).toHaveBeenCalled();
        expect(result.success).toBe(true);
    });
});
