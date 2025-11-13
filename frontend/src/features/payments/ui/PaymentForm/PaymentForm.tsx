import React, { useState } from 'react';
import type { PaymentsRepository } from '../../../../repositories/payments.repository';
import { paymentFormSchema } from '../../schemas/payment';
import { MfaModal } from '../MfaModal/MfaModal';

type Props = {
    repo: PaymentsRepository;
};

const maxAmount: number = 99999.99;

export const PaymentForm: React.FC<Props> = ({ repo }) => {
    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [mfaError, setMfaError] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [showMfaModal, setShowMfaModal] = useState(false);
    const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // validate form input
        const formValues = {
            fromAccount,
            toAccount,
            amount,
            memo,
        };

        const validationResult = paymentFormSchema.safeParse(formValues);
        if (!validationResult.success) {
            const fieldErrors: Record<string, string> = {};
            validationResult.error.issues.forEach((issue) => {
                if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setError(null);
        setErrors({});
        setLoading(true);

        // send payment information to backend after it has been validated
        try {
            const idempotencyKey = crypto.randomUUID?.() ?? `${Date.now()}`;
            const createUseCase = (await import('../../api/payment.usecases')).createPaymentUseCase(
                repo
            );
            const result = await createUseCase({
                fromAccount,
                toAccount,
                amount: parseFloat(amount),
                currency: 'USD', // add multiple currencies later
                memo,
                idempotencyKey,
            });

            if (result.success) {
                const payment = result.data;

                if (payment.requiresMfa) {
                    setPendingPaymentId(payment.payment.id);
                    setShowMfaModal(true);

                    try {
                        // fetch secret. only for demo purposes
                        const getSecretUseCase = (
                            await import('../../api/payment.usecases')
                        ).getSecret(repo);

                        if (payment.payment.id) {
                            const result = await getSecretUseCase(payment.payment.id);
                            console.log(result);
                        }
                    } catch (error: any) {
                        setError(error?.message || 'Failed to retrieve secret');
                    }
                } else {
                    setSuccessMsg('Payment completed successfully');
                }
            } else {
                setError('Payment failed. Try again');
            }
        } catch (err: any) {
            setError(err?.message ?? 'Payment failed. Try again');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmMfa = async (code: string) => {
        if (!pendingPaymentId) return;

        setLoading(true);
        setError(null);

        try {
            const confirmUseCase = (
                await import('../../api/payment.usecases')
            ).confirmPaymentUseCase(repo);
            const result = await confirmUseCase(pendingPaymentId, code);

            if (result.success) {
                setSuccessMsg('Payment confirmed successfully');
                setShowMfaModal(false);
                setPendingPaymentId(null);
            } else {
                setMfaError('Invalid code');
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to confirm payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-xl mt-6">
                <form
                    onSubmit={handleSubmit}
                    className="w-full flex flex-col items-stretch space-y-6"
                >
                    <div className="w-full max-w-lg">
                        <div className="mb-4">
                            <label
                                htmlFor="fromAccount"
                                className="block text-left text-sm font-medium mb-1 text-gray-700 dark:text-gray-200"
                            >
                                From Account
                            </label>

                            <div className="relative w-full">
                                <input
                                    id="fromAccount"
                                    className={`border p-2 rounded text-base w-full pr-40 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fromAccount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    type="text"
                                    value={fromAccount}
                                    onChange={(event) => setFromAccount(event.target.value)}
                                />

                                {errors.fromAccount && (
                                    <p className="absolute right-0 top-1/2 -translate-y-1/2 text-red-500 text-sm font-medium pr-2">
                                        {errors.fromAccount}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="toAccount"
                                className="block text-left text-sm font-medium mb-1 text-gray-700 dark:text-gray-200"
                            >
                                To Account
                            </label>

                            <div className="relative w-full">
                                <input
                                    id="toAccount"
                                    className={`border p-2 rounded text-base w-full pr-40 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.toAccount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    type="text"
                                    value={toAccount}
                                    onChange={(event) => setToAccount(event.target.value)}
                                />

                                {errors.toAccount && (
                                    <p className="absolute right-0 top-1/2 -translate-y-1/2 text-red-500 text-sm font-medium pr-2">
                                        {errors.toAccount}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="amount"
                                className="block text-left text-sm font-medium mb-1 text-gray-700 dark:text-gray-200"
                            >
                                Amount (USD)
                            </label>

                            <div className="relative w-full">
                                <input
                                    id="amount"
                                    className={`no-spinner border p-2 rounded text-base w-full pr-40 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    type="number"
                                    placeholder="00000.00"
                                    inputMode="decimal"
                                    max={maxAmount}
                                    step=".01"
                                    value={amount}
                                    onChange={(event) => {
                                        const value = event.target.value;

                                        if (parseFloat(value) > maxAmount) return;
                                        setAmount(value);
                                    }}
                                />

                                {errors.amount && (
                                    <p className="absolute right-0 top-1/2 -translate-y-1/2 text-red-500 text-sm font-medium pr-2">
                                        {errors.amount}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="memo"
                                className="block text-left text-sm font-medium mb-1 text-gray-700 dark:text-gray-200"
                            >
                                Memo
                            </label>

                            <div className="relative w-full">
                                <input
                                    id="memo"
                                    className="border p-2 rounded text-base w-full pr-40 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                                    type="text"
                                    value={memo}
                                    onChange={(event) => setMemo(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center mt-6">
                            <button
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Submit Payment'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {successMsg && (
                <div className="bg-green-600 p-4 rounded-lg shadow-md w-full max-w-xl mt-6">
                    <p className="text-white text-m font-bold" role="alert">
                        {successMsg}
                    </p>
                </div>
            )}

            {error && (
                <div className="bg-red-700 p-4 rounded-lg shadow-md w-full max-w-xl mt-6">
                    <p className="text-white text-m font-bold" role="alert">
                        {error}
                    </p>
                </div>
            )}

            <MfaModal
                open={showMfaModal}
                onClose={() => setShowMfaModal(false)}
                onSubmit={handleConfirmMfa}
                errorMsg={mfaError}
                clearErrorMsg={() => setMfaError('')}
                loading={loading}
            />
        </>
    );
};
