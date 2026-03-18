import { z } from 'zod';

export const EMOTIONS = [
  'alegre', 'tranquilo', 'agradecido', 'esperanzador', 'motivado',
  'ansioso', 'triste', 'enojado', 'frustrado', 'cansado',
  'confundido', 'solitario', 'abrumado', 'asustado', 'neutral',
] as const;

export type EmotionValue = typeof EMOTIONS[number];

export const createMoodSchema = z.object({
  score: z.number({ required_error: 'El puntaje es requerido' }).int().min(1).max(10),
  emotion: z.enum(EMOTIONS, { required_error: 'Selecciona cómo te sientes' }),
  note: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

export type CreateMoodFormData = z.infer<typeof createMoodSchema>;
