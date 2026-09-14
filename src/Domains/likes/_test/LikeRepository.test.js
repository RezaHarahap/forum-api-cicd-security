import LikeRepository from '../LikeRepository.js';

describe('LikeRepository interface', () => {
  it('throws when toggleLike is not implemented', async () => {
    const repository = new LikeRepository();

    await expect(repository.toggleLike('comment-1', 'user-1'))
      .rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
