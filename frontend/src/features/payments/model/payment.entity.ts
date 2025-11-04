// API entities used within program

export type PaymentId = string;

export interface Payment {
    id: PaymentId | null; // id is null until persisted to database
    fromAccount: string;
    toAccount: string;
    amount: number; // numeric cents or decimal
    currency: string;
    status: 'draft' | 'pending' | 'confirmed' | 'failed';
    createdAt?: Date;
    memo?: string;
}
