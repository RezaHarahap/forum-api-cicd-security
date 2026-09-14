export const up = (pgm) => {
  pgm.createTable('request_limits', {
    identifier: {
      type: 'TEXT',
      notNull: true,
    },
    ['window_start']: {
      type: 'TIMESTAMPTZ',
      notNull: true,
    },
    ['request_count']: {
      type: 'INTEGER',
      notNull: true,
      default: 0,
    },
  });

  pgm.addConstraint('request_limits', 'request_limits_primary_key', {
    primaryKey: ['identifier', 'window_start'],
  });
};

export const down = (pgm) => {
  pgm.dropTable('request_limits');
};
