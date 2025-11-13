import { z } from 'zod';

export const paymentFormSchema = z.object({
    fromAccount: z.string().min(1, '* Required'),
    toAccount: z.string().min(1, '* Required'),
    amount: z
        .string()
        .min(1, '* Required')
        .transform((val) => parseFloat(val))
        .refine((val) => !isNaN(val), { message: '* Invalid' })
        .refine((val) => val > 0, { message: '* Must be greater than 0' }),
    memo: z.string().optional(),
});
