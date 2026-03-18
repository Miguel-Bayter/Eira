import { z } from 'zod';

export const VALID_EMOTIONS = [
  'alegre', 'tranquilo', 'agradecido', 'esperanzador', 'motivado',
  'ansioso', 'triste', 'enojado', 'frustrado', 'cansado',
  'confundido', 'solitario', 'abrumado', 'asustado', 'neutral',
] as const;

export const createMoodSchema = z.object({
  score: z.number().int().min(1).max(10),
  emotion: z.enum(VALID_EMOTIONS),
  note: z.string().max(500).optional(),
});

export type CreateMoodInput = z.infer<typeof createMoodSchema>;
