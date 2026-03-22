// Single source of truth lives in packages/shared.
// This file re-exports everything so internal imports continue to work unchanged.
export {
  VALID_EMOTIONS,
  EMOTIONS,
  type EmotionValue,
  createMoodSchema,
  type CreateMoodInput,
  type CreateMoodFormData,
} from '@eira/shared';
