import NewComment from '../../Domains/comments/entities/NewComment.js';

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(payload, threadId, owner) {
    const newComment = new NewComment(payload);
    await this._threadRepository.verifyThreadAvailability(threadId);
    return this._commentRepository.addComment(newComment, threadId, owner);
  }
}

export default AddCommentUseCase;
