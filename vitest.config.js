import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['dotenv/config'],
    // Integration/functional tests share one PostgreSQL test database.
    // Running files sequentially prevents truncate/insert race conditions.
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/app.js',
        'src/Commons/config.js',
        'src/Infrastructures/container.js',
        'src/Infrastructures/database/postgres/pool.js',
      ],
    },
  },
});
