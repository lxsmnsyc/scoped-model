import createModel from '.';

describe('createModel', () => {
  it('returns an Object', () => {
    const model = createModel(() => ({
      state: {

      },
      action: {

      },
    }));
    expect(model).toBeTruthy();
    expect(typeof model).toBe('object');
    expect(typeof model.Provider).toBe('function');
    expect(typeof model.useState).toBe('function');
    expect(typeof model.useAction).toBe('function');
  });
});
