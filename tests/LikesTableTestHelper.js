/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const LikesTableTestHelper = {
  async addLike({ userId = 'user-123', commentId = 'comment-123' } = {}) {
    await pool.query({
      text: 'INSERT INTO comment_likes(user_id, comment_id) VALUES($1, $2)',
      values: [userId, commentId],
    });
  },

  async findLike(userId, commentId) {
    const result = await pool.query({
      text: 'SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    });
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

export default LikesTableTestHelper;
