import ThreadRepository from '../../Domains/threads/ThreadRepository.js';
import AddedThread from '../../Domains/threads/entities/AddedThread.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread({ title, body }, owner) {
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const result = await this._pool.query({
      text: `INSERT INTO threads(id, title, body, date, owner)
             VALUES($1, $2, $3, $4, $5)
             RETURNING id, title, owner`,
      values: [id, title, body, date, owner],
    });

    return new AddedThread(result.rows[0]);
  }

  async verifyThreadAvailability(id) {
    const result = await this._pool.query({
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async getThreadById(id) {
    const result = await this._pool.query({
      text: `SELECT t.id, t.title, t.body, t.date, u.username
             FROM threads t
             JOIN users u ON u.id = t.owner
             WHERE t.id = $1`,
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return result.rows[0];
  }
}

export default ThreadRepositoryPostgres;
