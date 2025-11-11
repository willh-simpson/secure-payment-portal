import { z } from 'zod';

export const paymentFormSchema = z.object({
    fromAccount: z.string().min(1, '* Required'),
    toAccount: z.string().min(1, '* Required'),
    amount: z.coerce
        .number()
        .positive('* Must be greater than 0')
        .refine((val) => !!val, { message: '* Required' }),
    memo: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
