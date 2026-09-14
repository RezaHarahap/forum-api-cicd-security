import express from 'express';

const createThreadsRouter = (handler, authenticate) => {
  const router = express.Router();

  router.post('/', authenticate, handler.postThreadHandler);
  router.get('/:threadId', handler.getThreadByIdHandler);
  router.post('/:threadId/comments', authenticate, handler.postCommentHandler);
  router.delete('/:threadId/comments/:commentId', authenticate, handler.deleteCommentHandler);
  router.put(
    '/:threadId/comments/:commentId/likes',
    authenticate,
    handler.putCommentLikeHandler,
  );
  router.post('/:threadId/comments/:commentId/replies', authenticate, handler.postReplyHandler);
  router.delete(
    '/:threadId/comments/:commentId/replies/:replyId',
    authenticate,
    handler.deleteReplyHandler,
  );

  return router;
};

export default createThreadsRouter;
