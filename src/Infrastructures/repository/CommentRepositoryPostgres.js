import CommentRepository from '../../Domains/comments/CommentRepository.js';
import AddedComment from '../../Domains/comments/entities/AddedComment.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment({ content }, threadId, owner) {
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const result = await this._pool.query({
      text: `INSERT INTO comments(id, content, date, owner, thread_id, is_delete)
             VALUES($1, $2, $3, $4, $5, false)
             RETURNING id, content, owner`,
      values: [id, content, date, owner, threadId],
    });

    return new AddedComment(result.rows[0]);
  }

  async verifyCommentAvailability(id, threadId) {
    const result = await this._pool.query({
      text: 'SELECT id FROM comments WHERE id = $1 AND thread_id = $2',
      values: [id, threadId],
    });

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async verifyCommentOwner(id, owner) {
    const result = await this._pool.query({
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }

  async deleteComment(id) {
    await this._pool.query({
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [id],
    });
  }

  async getCommentsByThreadId(threadId) {
    const result = await this._pool.query({
      text: `SELECT c.id, c.content, c.date, c.is_delete, u.username,
                    COUNT(cl.user_id)::integer AS "likeCount"
             FROM comments c
             JOIN users u ON u.id = c.owner
             LEFT JOIN comment_likes cl ON cl.comment_id = c.id
             WHERE c.thread_id = $1
             GROUP BY c.id, c.content, c.date, c.is_delete, u.username
             ORDER BY c.date ASC`,
      values: [threadId],
    });

    return result.rows;
  }
}

export default CommentRepositoryPostgres;
