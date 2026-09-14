import NewReply from '../NewReply.js';
describe('NewReply', () => {
  it('rejects incomplete payload', () => expect(() => new NewReply({})).toThrow('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'));
  it('rejects invalid type', () => expect(() => new NewReply({ content: 1 })).toThrow('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'));
  it('creates entity', () => expect(new NewReply({ content: 'ok' })).toEqual({ content: 'ok' }));
});
