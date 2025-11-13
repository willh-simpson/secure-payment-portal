import type { PaymentsRepository } from './payments.repository';
import type {
    ApiPaymentRequest,
    ApiPaymentResponse,
} from '../features/payments/model/payment.types';
import type { Payment } from '../features/payments/model/payment.entity';
import { createApiClient } from '../services/apiClient';
import type { Result } from '../shared/types/result';
import type { AxiosInstance } from 'axios';

function toDomain(api: ApiPaymentResponse): Payment {
    return {
        id: api.id,
        status:
            api.status === 'pending'
                ? 'pending'
                : api.status === 'confirmed'
                  ? 'confirmed'
                  : 'failed',
        fromAccount: api.fromAccount ?? '', // if api provides
        toAccount: api.toAccount ?? '',
        amount: Number(api.amount),
        currency: api.currency,
        createdAt: api.createdAt ? new Date(api.createdAt) : undefined,
        memo: api.memo ?? undefined,
    };
}

export class HttpPaymentsRepository implements PaymentsRepository {
    private client: AxiosInstance;

    constructor(client?: AxiosInstance) {
        this.client = client ?? createApiClient();
    }

    async create(
        payload: any
    ): Promise<Result<{ payment: Payment; requiresMfa?: boolean; mfaToken?: string }>> {
        try {
            const apiPayload: ApiPaymentRequest = {
                idempotencyKey: payload.idempotencyKey,
                fromAccount: payload.fromAccount,
                toAccount: payload.toAccount,
                amount: String(payload.amount),
                currency: payload.currency,
                memo: payload.memo,
            };
            const res = await this.client.post<ApiPaymentResponse>('/payments', apiPayload);

            return {
                success: true,
                data: {
                    payment: toDomain(res.data),
                    requiresMfa: res.data.requiresMfa,
                    mfaToken: res.data.mfaToken,
                },
            };
        } catch (err) {
            console.error('API call failed', err);
            return { success: false, error: 'Failed to create payment' };
        }
    }

    async confirm(paymentId: string, mfaCode: string): Promise<Result<Payment>> {
        try {
            const res = await this.client.put<ApiPaymentResponse>(
                `/payments/${paymentId}/confirm`,
                {
                    mfaCode,
                }
            );

            return { success: true, data: toDomain(res.data) };
        } catch (err) {
            console.error('API call failed', err);
            return { success: false, error: 'Failed to confirm payment' };
        }
    }

    async getById(id: string): Promise<Result<Payment | null>> {
        try {
            const res = await this.client.get<ApiPaymentResponse>(`/payments/${id}`);

            return { success: true, data: toDomain(res.data) };
        } catch (err) {
            console.error('API call failed', err);
            return { success: false, error: 'Payment not found' };
        }
    }

    async getSecret(paymentId: string): Promise<Result<Map<string, string>>> {
        try {
            const res = await this.client.get<Map<string, string>>(`/mfa/secret/${paymentId}`);

            return { success: true, data: res.data };
        } catch (err) {
            console.error('MFA call failed', err);
            return { success: false, error: 'Could not retrieve MFA secret' };
        }
    }
}
