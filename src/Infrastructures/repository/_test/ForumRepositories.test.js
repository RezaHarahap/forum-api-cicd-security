import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';

describe('Forum repositories integration', () => {
  const idGenerator = () => 'fixed';
  beforeEach(async () => { await UsersTableTestHelper.addUser({ id: 'user-123' }); });
  afterEach(async () => { await LikesTableTestHelper.cleanTable(); await RepliesTableTestHelper.cleanTable(); await CommentsTableTestHelper.cleanTable(); await ThreadsTableTestHelper.cleanTable(); await UsersTableTestHelper.cleanTable(); });

  it('persists and reads thread', async () => {
    const repo = new ThreadRepositoryPostgres(pool, idGenerator);
    const added = await repo.addThread({ title: 'title', body: 'body' }, 'user-123');
    const rows = await ThreadsTableTestHelper.findThreadById('thread-fixed');
    expect(added).toEqual({ id: 'thread-fixed', title: 'title', owner: 'user-123' });
    expect(rows).toHaveLength(1);
    await expect(repo.verifyThreadAvailability('missing')).rejects.toThrow('thread tidak ditemukan');
  });

  it('persists, authorizes, soft-deletes and lists comment', async () => {
    await ThreadsTableTestHelper.addThread();
    const repo = new CommentRepositoryPostgres(pool, idGenerator);
    const added = await repo.addComment({ content: 'hello' }, 'thread-123', 'user-123');
    expect(added).toEqual({ id: 'comment-fixed', content: 'hello', owner: 'user-123' });
    await repo.verifyCommentAvailability('comment-fixed', 'thread-123');
    await repo.verifyCommentOwner('comment-fixed', 'user-123');
    await expect(repo.verifyCommentOwner('comment-fixed', 'user-other')).rejects.toThrow('anda tidak berhak mengakses resource ini');
    await repo.deleteComment('comment-fixed');
    const rows = await CommentsTableTestHelper.findCommentById('comment-fixed');
    expect(rows[0].is_delete).toBe(true);
    expect(await repo.getCommentsByThreadId('thread-123')).toHaveLength(1);
  });

  it('persists, authorizes, soft-deletes and lists reply', async () => {
    await ThreadsTableTestHelper.addThread();
    await CommentsTableTestHelper.addComment();
    const repo = new ReplyRepositoryPostgres(pool, idGenerator);
    const added = await repo.addReply({ content: 'reply' }, 'comment-123', 'user-123');
    expect(added).toEqual({ id: 'reply-fixed', content: 'reply', owner: 'user-123' });
    await repo.verifyReplyAvailability('reply-fixed', 'comment-123');
    await repo.verifyReplyOwner('reply-fixed', 'user-123');
    await expect(repo.verifyReplyOwner('reply-fixed', 'user-other')).rejects.toThrow('anda tidak berhak mengakses resource ini');
    await repo.deleteReply('reply-fixed');
    const rows = await RepliesTableTestHelper.findReplyById('reply-fixed');
    expect(rows[0].is_delete).toBe(true);
    expect(await repo.getRepliesByCommentIds(['comment-123'])).toHaveLength(1);
    expect(await repo.getRepliesByCommentIds([])).toEqual([]);
  });

  it('toggles comment like and exposes likeCount', async () => {
    await ThreadsTableTestHelper.addThread();
    await CommentsTableTestHelper.addComment();
    const repository = new LikeRepositoryPostgres(pool);
    const commentRepository = new CommentRepositoryPostgres(pool, idGenerator);

    await repository.toggleLike('comment-123', 'user-123');
    expect(await LikesTableTestHelper.findLike('user-123', 'comment-123')).toHaveLength(1);
    expect((await commentRepository.getCommentsByThreadId('thread-123'))[0].likeCount).toBe(1);

    await repository.toggleLike('comment-123', 'user-123');
    expect(await LikesTableTestHelper.findLike('user-123', 'comment-123')).toHaveLength(0);
  });
});
