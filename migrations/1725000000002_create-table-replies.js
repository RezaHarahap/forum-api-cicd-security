export const up = (pgm) => {
  pgm.createTable('replies', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    content: { type: 'TEXT', notNull: true },
    date: { type: 'TIMESTAMPTZ', notNull: true },
    owner: { type: 'VARCHAR(50)', notNull: true, references: 'users', onDelete: 'CASCADE' },
    'comment_id': { type: 'VARCHAR(50)', notNull: true, references: 'comments', onDelete: 'CASCADE' },
    'is_delete': { type: 'BOOLEAN', notNull: true, default: false },
  });
};
export const down = (pgm) => pgm.dropTable('replies');
