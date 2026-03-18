import { z } from 'zod';

export const createMoodSchema = z.object({
  score: z.number().int().min(1).max(10),
  emotion: z.enum([
    'alegre', 'tranquilo', 'agradecido', 'esperanzador', 'motivado',
    'ansioso', 'triste', 'enojado', 'frustrado', 'cansado',
    'confundido', 'solitario', 'abrumado', 'asustado', 'neutral',
  ]),
  note: z.string().max(500).optional(),
});

export type CreateMoodFormData = z.infer<typeof createMoodSchema>;
