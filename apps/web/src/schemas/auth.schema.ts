// Single source of truth lives in packages/shared.
// This file re-exports everything so internal imports continue to work unchanged.
export {
  registerSchema,
  loginSchema,
  type RegisterFormData,
  type LoginFormData,
} from '@eira/shared';
