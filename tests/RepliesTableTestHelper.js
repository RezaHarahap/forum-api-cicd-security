/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';
const RepliesTableTestHelper = {
  async addReply({ id = 'reply-123', content = 'reply', owner = 'user-123', commentId = 'comment-123', date = new Date().toISOString(), isDelete = false } = {}) {
    await pool.query({ text: 'INSERT INTO replies(id,content,date,owner,comment_id,is_delete) VALUES($1,$2,$3,$4,$5,$6)', values: [id, content, date, owner, commentId, isDelete] });
  },
  async findReplyById(id) { const r = await pool.query({ text: 'SELECT * FROM replies WHERE id=$1', values: [id] }); return r.rows; },
  async cleanTable() { await pool.query('DELETE FROM replies WHERE 1=1'); },
};
export default RepliesTableTestHelper;
