import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'validation.name.minLength' }).max(100),
  email: z.string().email({ message: 'validation.email.invalid' }),
  password: z
    .string()
    .min(8, { message: 'validation.password.minLength' })
    .regex(/[A-Z]/, { message: 'validation.password.uppercase' })
    .regex(/[0-9]/, { message: 'validation.password.number' }),
}).strict();

export const loginSchema = z.object({
  email: z.string().email({ message: 'validation.email.invalid' }),
  password: z.string().min(1, { message: 'validation.password.required' }),
}).strict();

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
