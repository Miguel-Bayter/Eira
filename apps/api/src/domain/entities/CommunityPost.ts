import { AnonymousAlias } from '../value-objects/AnonymousAlias';
import { COMMUNITY_CONTENT_MIN_LENGTH, COMMUNITY_CONTENT_MAX_LENGTH } from '@eira/shared';
import { CommunityContentTooShortError, CommunityContentTooLongError } from '../errors';

export interface CreateCommunityPostProps {
  userId: string;
  content: string;
  isApproved?: boolean;
  rejectionReason?: string | null;
}

export interface CommunityPostProps {
  id: string;
  userId: string;
  anonymousAlias: string;
  content: string;
  isApproved: boolean;
  rejectionReason: string | null;
  createdAt: Date;
}

export class CommunityPost {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly anonymousAlias: AnonymousAlias,
    public readonly content: string,
    public readonly isApproved: boolean,
    public readonly rejectionReason: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: CreateCommunityPostProps): CommunityPost {
    const trimmed = props.content.trim();
    if (trimmed.length < COMMUNITY_CONTENT_MIN_LENGTH) {
      throw new CommunityContentTooShortError(COMMUNITY_CONTENT_MIN_LENGTH);
    }
    if (trimmed.length > COMMUNITY_CONTENT_MAX_LENGTH) {
      throw new CommunityContentTooLongError(COMMUNITY_CONTENT_MAX_LENGTH);
    }
    return new CommunityPost(
      crypto.randomUUID(),
      props.userId,
      AnonymousAlias.generate(),
      trimmed,
      props.isApproved ?? true,
      props.rejectionReason ?? null,
      new Date(),
    );
  }

  static reconstruct(props: CommunityPostProps): CommunityPost {
    return new CommunityPost(
      props.id,
      props.userId,
      AnonymousAlias.fromString(props.anonymousAlias),
      props.content,
      props.isApproved,
      props.rejectionReason,
      props.createdAt,
    );
  }
}
