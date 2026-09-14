import AddThreadUseCase from '../AddThreadUseCase.js';
import AddCommentUseCase from '../AddCommentUseCase.js';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import AddReplyUseCase from '../AddReplyUseCase.js';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';
import ToggleLikeCommentUseCase from '../ToggleLikeCommentUseCase.js';

describe('Forum use cases', () => {
  it('AddThreadUseCase delegates valid entity', async () => {
    const threadRepository = { addThread: vi.fn().mockResolvedValue({ id: 'thread-1', title: 't', owner: 'user-1' }) };
    const useCase = new AddThreadUseCase({ threadRepository });
    const result = await useCase.execute({ title: 't', body: 'b' }, 'user-1');
    expect(threadRepository.addThread).toHaveBeenCalledWith(expect.objectContaining({ title: 't', body: 'b' }), 'user-1');
    expect(result.id).toBe('thread-1');
  });

  it('AddCommentUseCase verifies thread then adds comment', async () => {
    const threadRepository = { verifyThreadAvailability: vi.fn().mockResolvedValue() };
    const commentRepository = { addComment: vi.fn().mockResolvedValue({ id: 'comment-1' }) };
    const useCase = new AddCommentUseCase({ threadRepository, commentRepository });
    await useCase.execute({ content: 'c' }, 'thread-1', 'user-1');
    expect(threadRepository.verifyThreadAvailability).toHaveBeenCalledWith('thread-1');
    expect(commentRepository.addComment).toHaveBeenCalledWith(expect.objectContaining({ content: 'c' }), 'thread-1', 'user-1');
  });

  it('DeleteCommentUseCase verifies ownership and soft deletes', async () => {
    const threadRepository = { verifyThreadAvailability: vi.fn().mockResolvedValue() };
    const commentRepository = { verifyCommentAvailability: vi.fn().mockResolvedValue(), verifyCommentOwner: vi.fn().mockResolvedValue(), deleteComment: vi.fn().mockResolvedValue() };
    const useCase = new DeleteCommentUseCase({ threadRepository, commentRepository });
    await useCase.execute('thread-1', 'comment-1', 'user-1');
    expect(commentRepository.verifyCommentAvailability).toHaveBeenCalledWith('comment-1', 'thread-1');
    expect(commentRepository.verifyCommentOwner).toHaveBeenCalledWith('comment-1', 'user-1');
    expect(commentRepository.deleteComment).toHaveBeenCalledWith('comment-1');
  });

  it('AddReplyUseCase verifies parent resources and adds reply', async () => {
    const threadRepository = { verifyThreadAvailability: vi.fn().mockResolvedValue() };
    const commentRepository = { verifyCommentAvailability: vi.fn().mockResolvedValue() };
    const replyRepository = { addReply: vi.fn().mockResolvedValue({ id: 'reply-1' }) };
    const useCase = new AddReplyUseCase({ threadRepository, commentRepository, replyRepository });
    await useCase.execute({ content: 'r' }, 'thread-1', 'comment-1', 'user-1');
    expect(commentRepository.verifyCommentAvailability).toHaveBeenCalledWith('comment-1', 'thread-1');
    expect(replyRepository.addReply).toHaveBeenCalledWith(expect.objectContaining({ content: 'r' }), 'comment-1', 'user-1');
  });

  it('DeleteReplyUseCase checks owner then soft deletes', async () => {
    const threadRepository = { verifyThreadAvailability: vi.fn().mockResolvedValue() };
    const commentRepository = { verifyCommentAvailability: vi.fn().mockResolvedValue() };
    const replyRepository = { verifyReplyAvailability: vi.fn().mockResolvedValue(), verifyReplyOwner: vi.fn().mockResolvedValue(), deleteReply: vi.fn().mockResolvedValue() };
    const useCase = new DeleteReplyUseCase({ threadRepository, commentRepository, replyRepository });
    await useCase.execute('thread-1', 'comment-1', 'reply-1', 'user-1');
    expect(replyRepository.verifyReplyAvailability).toHaveBeenCalledWith('reply-1', 'comment-1');
    expect(replyRepository.verifyReplyOwner).toHaveBeenCalledWith('reply-1', 'user-1');
    expect(replyRepository.deleteReply).toHaveBeenCalledWith('reply-1');
  });

  it('GetThreadDetailUseCase maps deleted comments/replies and groups replies', async () => {
    const threadRepository = { verifyThreadAvailability: vi.fn().mockResolvedValue(), getThreadById: vi.fn().mockResolvedValue({ id: 'thread-1', title: 't', body: 'b', date: '2026-01-01', username: 'u' }) };
    const commentRepository = { getCommentsByThreadId: vi.fn().mockResolvedValue([{ id: 'comment-1', content: 'hidden', 'is_delete': true, date: '2026-01-01', username: 'u', likeCount: 2 }]) };
    const replyRepository = { getRepliesByCommentIds: vi.fn().mockResolvedValue([{ id: 'reply-1', 'comment_id': 'comment-1', content: 'hidden', 'is_delete': true, date: '2026-01-01', username: 'u' }]) };
    const useCase = new GetThreadDetailUseCase({ threadRepository, commentRepository, replyRepository });
    const result = await useCase.execute('thread-1');
    expect(result.comments[0].content).toBe('**komentar telah dihapus**');
    expect(result.comments[0].likeCount).toBe(2);
    expect(result.comments[0].replies[0].content).toBe('**balasan telah dihapus**');
    expect(replyRepository.getRepliesByCommentIds).toHaveBeenCalledWith(['comment-1']);
  });

  it('ToggleLikeCommentUseCase verifies resources then toggles like', async () => {
    const threadRepository = { verifyThreadAvailability: vi.fn().mockResolvedValue() };
    const commentRepository = { verifyCommentAvailability: vi.fn().mockResolvedValue() };
    const likeRepository = { toggleLike: vi.fn().mockResolvedValue() };
    const useCase = new ToggleLikeCommentUseCase({
      threadRepository,
      commentRepository,
      likeRepository,
    });

    await useCase.execute('thread-1', 'comment-1', 'user-1');

    expect(threadRepository.verifyThreadAvailability).toHaveBeenCalledWith('thread-1');
    expect(commentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith('comment-1', 'thread-1');
    expect(likeRepository.toggleLike).toHaveBeenCalledWith('comment-1', 'user-1');
  });
});
