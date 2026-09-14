import ThreadsHandler from './handler.js';
import createThreadsRouter from './routes.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';

const threads = (container) => {
  const handler = new ThreadsHandler(container);
  const authenticate = async (req, res, next) => {
    try {
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) throw new AuthenticationError('Missing authentication');
      const token = header.slice(7);
      const manager = container.getInstance(AuthenticationTokenManager.name);
      await manager.verifyAccessToken(token);
      const payload = await manager.decodePayload(token);
      if (!payload?.id) throw new AuthenticationError('Invalid authentication');
      req.auth = { id: payload.id };
      next();
    } catch (error) {
      next(error instanceof AuthenticationError ? error : new AuthenticationError('Invalid authentication'));
    }
  };
  return createThreadsRouter(handler, authenticate);
};
export default threads;
