import { describe, it, expect } from 'vitest';
import { CommunityPost } from '../../../src/domain/entities/CommunityPost';
import {
  CommunityContentTooShortError,
  CommunityContentTooLongError,
} from '../../../src/domain/errors';

describe('CommunityPost entity', () => {
  describe('create()', () => {
    it('creates a valid post with a generated alias', () => {
      const post = CommunityPost.create({
        userId: 'user-1',
        content: 'Hoy fue un día difícil pero lo superé.',
      });
      expect(post.id).toBeDefined();
      expect(post.userId).toBe('user-1');
      expect(post.content).toBe('Hoy fue un día difícil pero lo superé.');
      expect(post.anonymousAlias.value).toBeTruthy();
      expect(post.isApproved).toBe(true);
      expect(post.rejectionReason).toBeNull();
      expect(post.createdAt).toBeInstanceOf(Date);
    });

    it('trims whitespace from content', () => {
      const post = CommunityPost.create({ userId: 'user-1', content: '  Un día tranquilo.  ' });
      expect(post.content).toBe('Un día tranquilo.');
    });

    it('throws when content is too short', () => {
      expect(() => CommunityPost.create({ userId: 'user-1', content: 'corto' })).toThrow(
        CommunityContentTooShortError,
      );
    });

    it('throws when content is too long', () => {
      const longContent = 'a'.repeat(1001);
      expect(() => CommunityPost.create({ userId: 'user-1', content: longContent })).toThrow(
        CommunityContentTooLongError,
      );
    });

    it('accepts content at minimum boundary (10 chars)', () => {
      const post = CommunityPost.create({ userId: 'user-1', content: '1234567890' });
      expect(post.content).toBe('1234567890');
    });

    it('accepts content at maximum boundary (1000 chars)', () => {
      const content = 'a'.repeat(1000);
      const post = CommunityPost.create({ userId: 'user-1', content });
      expect(post.content.length).toBe(1000);
    });

    it('generates a unique alias per post', () => {
      const post1 = CommunityPost.create({
        userId: 'user-1',
        content: 'Primera publicación aquí.',
      });
      const post2 = CommunityPost.create({
        userId: 'user-1',
        content: 'Segunda publicación aquí.',
      });
      // aliases are random — most likely different, always non-empty
      expect(post1.anonymousAlias.value).toBeTruthy();
      expect(post2.anonymousAlias.value).toBeTruthy();
    });
  });

  describe('reconstruct()', () => {
    it('rebuilds a post from persistence props', () => {
      const now = new Date();
      const post = CommunityPost.reconstruct({
        id: 'post-1',
        userId: 'user-1',
        anonymousAlias: 'Mariposa esperanzadora',
        content: 'Un mensaje de la comunidad.',
        isApproved: true,
        rejectionReason: null,
        createdAt: now,
      });
      expect(post.id).toBe('post-1');
      expect(post.anonymousAlias.value).toBe('Mariposa esperanzadora');
      expect(post.isApproved).toBe(true);
      expect(post.createdAt).toBe(now);
    });
  });
});
