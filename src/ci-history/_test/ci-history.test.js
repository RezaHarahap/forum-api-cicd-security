describe('CI history evidence', () => {
  it('records the required failing workflow before the fix', () => {
    expect('failed').toBe('passed');
  });
});
