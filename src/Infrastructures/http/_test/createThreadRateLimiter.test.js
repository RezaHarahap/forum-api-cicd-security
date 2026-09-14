import { describe, expect, it, vi } from 'vitest';
import createThreadRateLimiter from '../createThreadRateLimiter.js';

const createResponse = () => ({
  set: vi.fn(),
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

describe('createThreadRateLimiter', () => {
  it('should continue when request count is within the limit', async () => {
    const pool = {
      query: vi.fn().mockResolvedValue({ rows: [{ request_count: 90 }] }),
    };
    const req = {
      headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
      ip: '127.0.0.1',
      socket: {},
    };
    const res = createResponse();
    const next = vi.fn();

    await createThreadRateLimiter(pool, 90)(req, res, next);

    expect(pool.query).toHaveBeenCalledWith(expect.objectContaining({
      values: ['203.0.113.10'],
    }));
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should respond with 429 when request count exceeds the limit', async () => {
    const pool = {
      query: vi.fn().mockResolvedValue({ rows: [{ request_count: 91 }] }),
    };
    const req = { headers: {}, ip: '127.0.0.1', socket: {} };
    const res = createResponse();
    const next = vi.fn();

    await createThreadRateLimiter(pool, 90)(req, res, next);

    expect(res.set).toHaveBeenCalledWith('Retry-After', '60');
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'terlalu banyak permintaan, silakan coba lagi nanti',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should forward database errors to the error handler', async () => {
    const error = new Error('database unavailable');
    const pool = { query: vi.fn().mockRejectedValue(error) };
    const req = { headers: {}, socket: { remoteAddress: '127.0.0.1' } };
    const res = createResponse();
    const next = vi.fn();

    await createThreadRateLimiter(pool)(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
