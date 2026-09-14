import LikeRepository from '../../Domains/likes/LikeRepository.js';

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async toggleLike(commentId, userId) {
    const insertResult = await this._pool.query({
      text: `INSERT INTO comment_likes(user_id, comment_id)
             VALUES($1, $2)
             ON CONFLICT (user_id, comment_id) DO NOTHING`,
      values: [userId, commentId],
    });

    if (!insertResult.rowCount) {
      await this._pool.query({
        text: 'DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
        values: [userId, commentId],
      });
    }
  }
}

export default LikeRepositoryPostgres;
