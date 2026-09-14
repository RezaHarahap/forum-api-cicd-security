import ReplyRepository from '../../Domains/replies/ReplyRepository.js';
import AddedReply from '../../Domains/replies/entities/AddedReply.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply({ content }, commentId, owner) {
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const result = await this._pool.query({
      text: `INSERT INTO replies(id, content, date, owner, comment_id, is_delete)
             VALUES($1, $2, $3, $4, $5, false)
             RETURNING id, content, owner`,
      values: [id, content, date, owner, commentId],
    });

    return new AddedReply(result.rows[0]);
  }

  async verifyReplyAvailability(id, commentId) {
    const result = await this._pool.query({
      text: 'SELECT id FROM replies WHERE id = $1 AND comment_id = $2',
      values: [id, commentId],
    });

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async verifyReplyOwner(id, owner) {
    const result = await this._pool.query({
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }

  async deleteReply(id) {
    await this._pool.query({
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [id],
    });
  }

  async getRepliesByCommentIds(commentIds) {
    if (!commentIds.length) {
      return [];
    }

    const result = await this._pool.query({
      text: `SELECT r.id, r.content, r.date, r.is_delete, r.comment_id, u.username
             FROM replies r
             JOIN users u ON u.id = r.owner
             WHERE r.comment_id = ANY($1::varchar[])
             ORDER BY r.date ASC`,
      values: [commentIds],
    });

    return result.rows;
  }
}

export default ReplyRepositoryPostgres;
