import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { HttpPaymentsRepository as HttpPaymentsRepositoryType } from '../../../repositories/payments.repository.http';

jest.unstable_mockModule('../../../services/apiClient', () => {
    const post = jest.fn();
    const get = jest.fn();
    const put = jest.fn();
    const del = jest.fn();

    return {
        __esModule: true,
        createApiClient: jest.fn(() => ({ post, get, put, delete: del })),
    };
});

const { createApiClient } = await import('../../../services/apiClient');
const { HttpPaymentsRepository } = await import('../../../repositories/payments.repository.http');
const { createPaymentUseCase, confirmPaymentUseCase } = await import(
    '../../../features/payments/api/payment.usecases'
);
const { Results } = await import('../../../shared/types/result');

describe('payment integration (use case + HTTP repo)', () => {
    let repo: InstanceType<typeof HttpPaymentsRepositoryType>;
    let mockedClient: jest.Mocked<AxiosInstance>;

    beforeEach(() => {
        jest.clearAllMocks();

        // create new mock instance before each test
        mockedClient = createApiClient() as unknown as jest.Mocked<AxiosInstance>;
        repo = new HttpPaymentsRepository(mockedClient);
    });

    test('creates payment successfully', async () => {
        const mockResponse: Partial<AxiosResponse> = {
            data: {
                id: 'p1',
                status: 'pending',
                amount: '100.0',
                currency: 'USD',
                createdAt: new Date().toISOString(),
            },
        };

        mockedClient.post.mockResolvedValueOnce(mockResponse as AxiosResponse);

        const useCase = createPaymentUseCase(repo);
        const result = await useCase({
            fromAccount: '111',
            toAccount: '222',
            amount: 100,
            currency: 'USD',
        });

        expect(Results.isOk(result)).toBe(true);
        if (Results.isOk(result)) {
            expect(result.data.payment.id).toBe('p1');
            expect(result.data.payment.status).toBe('pending');
        }
    });

    test('handles repo creation failure', async () => {
        mockedClient.post.mockRejectedValueOnce(new Error('Network error'));

        // silence console.error when running test
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const useCase = createPaymentUseCase(repo);
        const result = await useCase({
            fromAccount: '111',
            toAccount: '222',
            amount: 100,
            currency: 'USD',
        });

        expect(Results.isError(result)).toBe(true);
        if (Results.isError(result)) expect(result.error).toMatch(/create payment/);
        // assert error log happened
        expect(consoleErrorSpy).toHaveBeenCalledWith('API call failed', expect.any(Error));

        // restore console behavior
        consoleErrorSpy.mockRestore();
    });

    test('handles repo confirmation failure', async () => {
        mockedClient.post.mockRejectedValueOnce(new Error('Network error'));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const useCase = confirmPaymentUseCase(repo);
        const result = await useCase('p1', '123');

        expect(Results.isError(result)).toBe(true);
        if (Results.isError(result)) expect(result.error).toMatch(/confirm payment/);
        expect(consoleErrorSpy).toHaveBeenCalledWith('API call failed', expect.any(Error));
    });

    test('returns MFA flag and token when API requires additional authentication', async () => {
        mockedClient.post.mockResolvedValueOnce({
            data: {
                id: 'p1',
                status: 'pending',
                amount: '100.0',
                currency: 'USD',
                createdAt: new Date().toISOString(),
                requiresMfa: true,
                mfaToken: '123',
            },
        });

        const useCase = createPaymentUseCase(repo);
        const result = await useCase({
            fromAccount: '111',
            toAccount: '222',
            amount: 100,
            currency: 'USD',
        });

        expect(Results.isOk(result)).toBe(true);
        if (Results.isOk(result)) {
            expect(result.data.requiresMfa).toBe(true);
            expect(result.data.mfaToken).toBe('123');
        }
    });

    test('rejects invalid amount before calling repo', async () => {
        const useCase = createPaymentUseCase(repo);
        const result = await useCase({
            fromAccount: '111',
            toAccount: '222',
            amount: -100,
            currency: 'USD',
        });

        expect(Results.isError(result)).toBe(true);
        if (Results.isError(result)) expect(result.error).toMatch(/greater than 0/);
    });

    test('rejects same from/to account before calling repo', async () => {
        const useCase = createPaymentUseCase(repo);
        const result = await useCase({
            fromAccount: '111',
            toAccount: '111',
            amount: 100,
            currency: 'USD',
        });

        expect(Results.isError(result)).toBe(true);
        if (Results.isError(result)) expect(result.error).toMatch(/same account/);
    });

    test('confirms payment successfully after MFA', async () => {
        mockedClient.post.mockResolvedValueOnce({
            data: {
                id: 'p1',
                status: 'confirmed',
                amount: '100.0',
                currency: 'USD',
                createdAt: new Date().toISOString(),
            },
        });

        const useCase = confirmPaymentUseCase(repo);
        const result = await useCase('p1', '123');

        expect(Results.isOk(result)).toBe(true);
        if (Results.isOk(result)) expect(result.data.status).toBe('confirmed');
    });

    test('fails if MFA code is missing', async () => {
        const useCase = confirmPaymentUseCase(repo);
        const result = await useCase('p1', '');

        expect(Results.isError(result)).toBe(true);
        if (Results.isError(result)) expect(result.error).toMatch(/mfa code required/i);
    });

    test('retrieves payment by id successfully', async () => {
        mockedClient.get.mockResolvedValueOnce({
            data: {
                id: 'p1',
                status: 'confirmed',
                amount: '100.0',
                currency: 'USD',
                createdAt: new Date().toISOString(),
            },
        });

        const result = await repo.getById('p1');

        expect(Results.isOk(result)).toBe(true);
        if (Results.isOk(result)) {
            expect(result.data?.status).toBe('confirmed');
            expect(result.data?.amount).toBe(100);
        }
    });

    test('formats outgoing payload correctly', async () => {
        mockedClient.post.mockResolvedValueOnce({
            data: {
                id: 'p1',
                status: 'pending',
                amount: '100.0',
                currency: 'USD',
                createdAt: new Date().toISOString(),
            },
        });

        await repo.create({
            fromAccount: '111',
            toAccount: '222',
            amount: 100,
            currency: 'usd',
        });

        expect(mockedClient.post).toHaveBeenCalledWith(
            '/payments',
            expect.objectContaining({
                amount: '100',
                currency: 'usd',
            })
        );
    });
});
