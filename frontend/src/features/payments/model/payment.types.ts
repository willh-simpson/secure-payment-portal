// API DTOs

export type ApiPaymentRequest = {
    idempotencyKey?: string;
    fromAccount: string;
    toAccount: string;
    amount: string; // stored as string in cents or decimal per API contract
    currency: string; // example: 'USD'
    memo?: string;
};

export type ApiPaymentResponse = {
    id: string;
    status: 'pending' | 'confirmed' | 'failed';
    createdAt: string; // ISO date
    fromAccount: string; // masked or full depending on security level
    toAccount: string;
    amount: string;
    currency: string;
    memo?: string;
    requiresMfa?: boolean;
    mfaToken?: string;
};
