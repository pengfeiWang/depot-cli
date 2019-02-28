import build from './build';


describe('build', () => {
  it('build', () => {
    expect(
      build({
        pathname: '/index',
      }),
    ).toEqual({
      pathname: '/index.html',
    });
  });

});
