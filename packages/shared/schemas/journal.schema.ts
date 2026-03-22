import { z } from 'zod';

export const JOURNAL_CONTENT_MAX_LENGTH = 5000;

export const createJournalEntrySchema = z.object({
  content: z
    .string({ required_error: 'validation.journal.content.required' })
    .trim()
    .min(1, { message: 'validation.journal.content.required' })
    .max(JOURNAL_CONTENT_MAX_LENGTH, { message: 'validation.journal.content.maxLength' }),
}).strict();

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
