import { create } from 'zustand';
import type { Payment } from '../model/payment.entity';

type PaymentsState = {
    payments: Payment[];
    selectedPaymentId: string | null;
    loading: boolean;
    error?: string | null;
    setPayments: (paymentList: Payment[]) => void;
    addPayment: (payment: Payment) => void;
    updatePayment: (payment: Payment) => void;
    selectPayment: (id: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (err?: string | null) => void;
};

export const usePaymentsStore = create<PaymentsState>((set) => ({
    payments: [],
    selectedPaymentId: null,
    loading: false,
    error: null,
    setPayments: (paymentList) => set({ payments: paymentList }),
    addPayment: (payment) =>
        set((state) => ({
            payments: [...state.payments, payment],
        })),
    updatePayment: (payment) =>
        set((state) => {
            const index = state.payments.findIndex((x) => x.id === payment.id);

            if (index === -1) {
                return state;
            }

            const updated = [...state.payments];
            updated[index] = payment;

            return { payments: updated };
        }),
    selectPayment: (id) => set({ selectedPaymentId: id }),
    setLoading: (loading) => set({ loading: loading }),
    setError: (err) => set({ error: err }),
}));
