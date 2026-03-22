import { z } from 'zod';

export const sendChatMessageSchema = z.object({
  message: z
    .string({ required_error: 'validation.chat.message.required' })
    .trim()
    .min(1, { message: 'validation.chat.message.required' })
    .max(2000, { message: 'validation.chat.message.maxLength' }),
}).strict();

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
