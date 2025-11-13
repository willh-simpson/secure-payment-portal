import type { Payment } from '../features/payments/model/payment.entity';
import type { Result } from '../shared/types/result';

export interface PaymentsRepository {
    create(
        payment: Omit<Payment, 'id' | 'status' | 'createdAt'> & { idempotencyKey?: string }
    ): Promise<Result<{ payment: Payment; requiresMfa?: boolean; mfaToken?: string }>>;

    confirm(paymentId: string, mfaCode: string): Promise<Result<Payment>>;

    getById(id: string): Promise<Result<Payment | null>>;

    // demo purposes only
    getSecret(paymentId: string): Promise<Result<Map<string, string>>>;
}
