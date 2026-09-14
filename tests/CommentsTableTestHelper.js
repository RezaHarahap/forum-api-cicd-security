/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';
const CommentsTableTestHelper = {
  async addComment({ id = 'comment-123', content = 'comment', owner = 'user-123', threadId = 'thread-123', date = new Date().toISOString(), isDelete = false } = {}) {
    await pool.query({ text: 'INSERT INTO comments(id,content,date,owner,thread_id,is_delete) VALUES($1,$2,$3,$4,$5,$6)', values: [id,content,date,owner,threadId,isDelete] });
  },
  async findCommentById(id) { const r = await pool.query({ text: 'SELECT * FROM comments WHERE id=$1', values: [id] }); return r.rows; },
  async cleanTable() { await pool.query('DELETE FROM comments WHERE 1=1'); },
};
export default CommentsTableTestHelper;
