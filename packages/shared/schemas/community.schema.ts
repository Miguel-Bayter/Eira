import { z } from 'zod';

export const COMMUNITY_CONTENT_MIN_LENGTH = 10;
export const COMMUNITY_CONTENT_MAX_LENGTH = 1000;

export const createCommunityPostSchema = z
  .object({
    content: z
      .string()
      .min(COMMUNITY_CONTENT_MIN_LENGTH, 'validation.community.content.minLength')
      .max(COMMUNITY_CONTENT_MAX_LENGTH, 'validation.community.content.maxLength'),
  })
  .strict();

export type CreateCommunityPostFormData = z.infer<typeof createCommunityPostSchema>;
