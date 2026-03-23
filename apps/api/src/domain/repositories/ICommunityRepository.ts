import type { CommunityPost } from '../entities/CommunityPost';

export interface CommunityFeedPage {
  posts: CommunityPost[];
  nextCursor: string | null;
}

export interface ICommunityRepository {
  save(post: CommunityPost): Promise<void>;
  findApprovedFeed(cursor: string | null, limit: number): Promise<CommunityFeedPage>;
  countTodayByUser(userId: string): Promise<number>;
}
