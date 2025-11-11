import { HttpPaymentsRepository } from '../../repositories/payments.repository.http';
import { PaymentForm } from '../../features/payments/ui/PaymentForm/PaymentForm';

const repo = new HttpPaymentsRepository();

export default function PaymentsPage() {
    return (
        <div style={{ padding: 20 }}>
            <h1>Payments</h1>
            <PaymentForm repo={repo} />
        </div>
    );
}
