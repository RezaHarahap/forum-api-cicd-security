const getClientIdentifier = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket.remoteAddress || 'unknown';
};

const createThreadRateLimiter = (pool, maximumRequests = 90) => async (req, res, next) => {
  try {
    const identifier = getClientIdentifier(req);
    const result = await pool.query({
      text: `INSERT INTO request_limits(identifier, window_start, request_count)
             VALUES($1, date_trunc('minute', CURRENT_TIMESTAMP), 1)
             ON CONFLICT (identifier, window_start)
             DO UPDATE SET request_count = request_limits.request_count + 1
             RETURNING request_count AS "requestCount"`,
      values: [identifier],
    });

    if (result.rows[0].requestCount > maximumRequests) {
      res.set('Retry-After', '60');
      return res.status(429).json({
        status: 'fail',
        message: 'terlalu banyak permintaan, silakan coba lagi nanti',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export default createThreadRateLimiter;
