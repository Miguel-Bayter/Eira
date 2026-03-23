import type { ICommunityRepository } from '@domain/repositories/ICommunityRepository';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export interface GetCommunityFeedInput {
  cursor?: string | null;
  limit?: number;
}

export interface CommunityPostDTO {
  id: string;
  anonymousAlias: string;
  content: string;
  createdAt: string;
}

export interface GetCommunityFeedOutput {
  posts: CommunityPostDTO[];
  nextCursor: string | null;
}

export class GetCommunityFeedUseCase {
  constructor(private readonly communityRepo: ICommunityRepository) {}

  async execute(input: GetCommunityFeedInput = {}): Promise<GetCommunityFeedOutput> {
    const limit = Math.min(input.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const { posts, nextCursor } = await this.communityRepo.findApprovedFeed(
      input.cursor ?? null,
      limit,
    );

    return {
      posts: posts.map((p) => ({
        id: p.id,
        anonymousAlias: p.anonymousAlias.value,
        content: p.content,
        createdAt: p.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }
}
