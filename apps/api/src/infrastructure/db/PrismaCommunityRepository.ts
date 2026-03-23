import type { PrismaClient } from '@prisma/client';
import type {
  ICommunityRepository,
  CommunityFeedPage,
} from '@domain/repositories/ICommunityRepository';
import { CommunityPost } from '@domain/entities/CommunityPost';

export class PrismaCommunityRepository implements ICommunityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(post: CommunityPost): Promise<void> {
    await this.prisma.community_posts.create({
      data: {
        id: post.id,
        user_id: post.userId,
        anonymous_alias: post.anonymousAlias.value,
        content: post.content,
        is_approved: post.isApproved,
        rejection_reason: post.rejectionReason,
        created_at: post.createdAt,
      },
    });
  }

  async findApprovedFeed(cursor: string | null, limit: number): Promise<CommunityFeedPage> {
    const rows = await this.prisma.community_posts.findMany({
      where: { is_approved: true },
      orderBy: { created_at: 'desc' },
      take: limit + 1, // fetch one extra to determine if there's a next page
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? (pageRows[pageRows.length - 1]?.id ?? null) : null;

    return {
      posts: pageRows.map((row) =>
        CommunityPost.reconstruct({
          id: row.id,
          userId: row.user_id,
          anonymousAlias: row.anonymous_alias,
          content: row.content,
          isApproved: row.is_approved,
          rejectionReason: row.rejection_reason,
          createdAt: row.created_at,
        }),
      ),
      nextCursor,
    };
  }

  async countTodayByUser(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return this.prisma.community_posts.count({
      where: { user_id: userId, created_at: { gte: startOfDay } },
    });
  }
}
