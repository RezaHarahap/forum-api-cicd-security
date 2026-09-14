import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import createServer from '../createServer.js';
import container from '../../container.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';

describe('Forum API functional test', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  const createUserAndToken = async (app, username = 'dicoding') => {
    await request(app).post('/users').send({
      username,
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    });
    const login = await request(app).post('/authentications').send({
      username,
      password: 'secret',
    });
    return login.body.data.accessToken;
  };

  it('supports thread, comment, reply, detail and soft delete flow', async () => {
    const app = await createServer(container);
    const token = await createUserAndToken(app);

    const threadResponse = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'sebuah thread', body: 'sebuah body thread' });

    expect(threadResponse.status).toBe(201);
    const threadId = threadResponse.body.data.addedThread.id;

    const commentResponse = await request(app)
      .post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'sebuah comment' });

    expect(commentResponse.status).toBe(201);
    const commentId = commentResponse.body.data.addedComment.id;

    const likeResponse = await request(app)
      .put(`/threads/${threadId}/comments/${commentId}/likes`)
      .set('Authorization', `Bearer ${token}`);

    expect(likeResponse.status).toBe(200);

    const replyResponse = await request(app)
      .post(`/threads/${threadId}/comments/${commentId}/replies`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'sebuah balasan' });

    expect(replyResponse.status).toBe(201);
    const replyId = replyResponse.body.data.addedReply.id;

    expect((await request(app)
      .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
      .set('Authorization', `Bearer ${token}`)).status).toBe(200);

    expect((await request(app)
      .delete(`/threads/${threadId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`)).status).toBe(200);

    const detail = await request(app).get(`/threads/${threadId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.thread.comments[0].content)
      .toBe('**komentar telah dihapus**');
    expect(detail.body.data.thread.comments[0].likeCount).toBe(1);
    expect(detail.body.data.thread.comments[0].replies[0].content)
      .toBe('**balasan telah dihapus**');
  });

  it('likes and unlikes a comment through the same route', async () => {
    const app = await createServer(container);
    const token = await createUserAndToken(app);
    const threadResponse = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'title', body: 'body' });
    const { id: threadId } = threadResponse.body.data.addedThread;
    const commentResponse = await request(app)
      .post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'comment' });
    const { id: commentId } = commentResponse.body.data.addedComment;
    const likePath = `/threads/${threadId}/comments/${commentId}/likes`;

    expect((await request(app).put(likePath)
      .set('Authorization', `Bearer ${token}`)).status).toBe(200);
    expect((await request(app).get(`/threads/${threadId}`))
      .body.data.thread.comments[0].likeCount).toBe(1);

    expect((await request(app).put(likePath)
      .set('Authorization', `Bearer ${token}`)).status).toBe(200);
    expect((await request(app).get(`/threads/${threadId}`))
      .body.data.thread.comments[0].likeCount).toBe(0);
  });

  it('protects restricted resources and validates payloads', async () => {
    const app = await createServer(container);
    expect((await request(app).post('/threads').send({ title: 'x', body: 'y' })).status)
      .toBe(401);

    const token = await createUserAndToken(app);
    const invalid = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'missing body' });
    expect(invalid.status).toBe(400);
  });
});
