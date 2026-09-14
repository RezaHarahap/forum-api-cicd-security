import NewThread from '../NewThread.js';
describe('NewThread', () => {
  it('rejects incomplete payload', () => expect(() => new NewThread({ title: 'x' })).toThrow('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'));
  it('rejects invalid type', () => expect(() => new NewThread({ title: 'x', body: 1 })).toThrow('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'));
  it('creates entity', () => expect(new NewThread({ title: 'x', body: 'y' })).toEqual({ title: 'x', body: 'y' }));
});
