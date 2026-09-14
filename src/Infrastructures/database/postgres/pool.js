/* istanbul ignore file */
import { Pool } from 'pg';
import config from '../../../Commons/config.js';

const pool = new Pool({
  ...config.database,
  // Test runners create and tear down worker processes. Allowing an idle test
  // pool to release the event loop avoids cross-test `pool.end()` races.
  allowExitOnIdle: process.env.NODE_ENV === 'test',
});

export default pool;
