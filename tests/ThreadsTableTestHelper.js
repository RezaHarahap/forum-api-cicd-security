/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';
const ThreadsTableTestHelper = {
  async addThread({ id = 'thread-123', title = 'thread', body = 'body', owner = 'user-123', date = new Date().toISOString() } = {}) {
    await pool.query({ text: 'INSERT INTO threads(id,title,body,date,owner) VALUES($1,$2,$3,$4,$5)', values: [id,title,body,date,owner] });
  },
  async findThreadById(id) { const r = await pool.query({ text: 'SELECT * FROM threads WHERE id=$1', values: [id] }); return r.rows; },
  async cleanTable() { await pool.query('DELETE FROM threads WHERE 1=1'); },
};
export default ThreadsTableTestHelper;
