import type { ICommunityRepository } from '@domain/repositories/ICommunityRepository';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { IAiService } from '@domain/services/IAiService';
import { CommunityPost } from '@domain/entities/CommunityPost';
import { UserNotFoundError, DailyLimitExceededError } from '@domain/errors';

const DAILY_POST_LIMIT = 3;

export interface CreateCommunityPostInput {
  userId: string;
  content: string;
}

export interface CreateCommunityPostOutput {
  id: string;
  anonymousAlias: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export class CreateCommunityPostUseCase {
  constructor(
    private readonly communityRepo: ICommunityRepository,
    private readonly userRepo: IUserRepository,
    private readonly aiService?: IAiService,
  ) {}

  async execute(input: CreateCommunityPostInput): Promise<CreateCommunityPostOutput> {
    const user = await this.userRepo.findBySupabaseId(input.userId);
    if (!user) throw new UserNotFoundError(input.userId);

    const todayCount = await this.communityRepo.countTodayByUser(user.id);
    if (todayCount >= DAILY_POST_LIMIT) {
      throw new DailyLimitExceededError('community posts', DAILY_POST_LIMIT);
    }

    let isApproved = true;
    let rejectionReason: string | null = null;

    if (this.aiService) {
      try {
        const moderation = await this.aiService.moderate(input.content);
        isApproved = moderation.isApproved;
        rejectionReason = moderation.reason ?? null;
      } catch {
        // AI unavailable — fallback to auto-approve so users are not blocked
        isApproved = true;
      }
    }

    const post = CommunityPost.create({
      userId: user.id,
      content: input.content,
      isApproved,
      rejectionReason,
    });
    await this.communityRepo.save(post);

    return {
      id: post.id,
      anonymousAlias: post.anonymousAlias.value,
      content: post.content,
      isApproved: post.isApproved,
      createdAt: post.createdAt.toISOString(),
    };
  }
}
