class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadAvailability(threadId);

    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const commentIds = comments.map((comment) => comment.id);
    const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);

    const repliesByCommentId = replies.reduce((groupedReplies, reply) => {
      const formattedReply = {
        id: reply.id,
        content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
        date: reply.date,
        username: reply.username,
      };

      if (!groupedReplies[reply.comment_id]) {
        groupedReplies[reply.comment_id] = [];
      }
      groupedReplies[reply.comment_id].push(formattedReply);
      return groupedReplies;
    }, {});

    return {
      ...thread,
      comments: comments.map((comment) => ({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        likeCount: comment.likeCount,
        replies: repliesByCommentId[comment.id] || [],
        content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      })),
    };
  }
}

export default GetThreadDetailUseCase;
