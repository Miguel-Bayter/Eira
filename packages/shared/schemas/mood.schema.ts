import { z } from 'zod';

export const VALID_EMOTIONS = [
  'alegre', 'tranquilo', 'agradecido', 'esperanzador', 'motivado',
  'ansioso', 'triste', 'enojado', 'frustrado', 'cansado',
  'confundido', 'solitario', 'abrumado', 'asustado', 'neutral',
] as const;

/** @deprecated Use VALID_EMOTIONS */
export const EMOTIONS = VALID_EMOTIONS;

export type EmotionValue = typeof VALID_EMOTIONS[number];

export const createMoodSchema = z.object({
  score: z.number({ required_error: 'validation.mood.score.required' }).int().min(1).max(10),
  emotion: z.enum(VALID_EMOTIONS, { required_error: 'validation.mood.emotion.required' }),
  note: z.string().max(500, { message: 'validation.mood.note.maxLength' }).optional(),
}).strict();

export type CreateMoodInput = z.infer<typeof createMoodSchema>;

/** @deprecated Use CreateMoodInput */
export type CreateMoodFormData = CreateMoodInput;
