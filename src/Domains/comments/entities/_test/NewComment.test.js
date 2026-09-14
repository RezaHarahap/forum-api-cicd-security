import NewComment from '../NewComment.js';
describe('NewComment', () => {
  it('rejects incomplete payload', () => expect(() => new NewComment({})).toThrow('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'));
  it('rejects invalid type', () => expect(() => new NewComment({ content: 1 })).toThrow('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'));
  it('creates entity', () => expect(new NewComment({ content: 'ok' })).toEqual({ content: 'ok' }));
});
