import React, { useState } from 'react';
import type { PaymentsRepository } from '../../../../repositories/payments.repository';

type Props = {
    repo: PaymentsRepository;
};

export const PaymentForm: React.FC<Props> = ({ repo }) => {
    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [memo, setMemo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const idempotencyKey = crypto.randomUUID?.() ?? `${Date.now()}`;
            const createUseCase = (await import('../../api/payment.usecases')).createPaymentUseCase(
                repo
            );
            const result = await createUseCase({
                fromAccount,
                toAccount,
                amount,
                currency: 'USD', // add multiple currencies later
                memo,
                idempotencyKey,
            });

            if (result.success) {
                if (result.data.requiresMfa) {
                    alert(`Multi-Factor Authentication required. Token. ${result.data.mfaToken}`);
                    // TODO: open mfa modal, call confirm usecase
                } else {
                    alert(`Payment created: ${result.data.payment.id}`);
                }
            }
        } catch (err: any) {
            setError(err?.message ?? 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="fromAccount">From account</label>
                <br />
                <input
                    value={fromAccount}
                    onChange={(event) => setFromAccount(event.target.value)}
                />
            </div>

            <div>
                <label htmlFor="amount">Amount (USD)</label>
                <br />
                <input
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(Number(event.target.value))}
                    step="0.01"
                />
            </div>

            <div>
                <label htmlFor="memo">Memo</label>
                <br />
                <input value={memo} onChange={(event) => setMemo(event.target.value)} />
            </div>

            <div style={{ marginTop: 12 }}>
                <button type="submit" disabled={loading}>
                    Submit
                </button>
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
    );
};
