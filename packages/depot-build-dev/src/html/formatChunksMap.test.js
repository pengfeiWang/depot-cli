import formatChunksMap from './formatChunksMap';

describe('formatChunksMap', () => {
  it('normal', () => {
    expect(
      formatChunksMap({
        a: ['a.1816b15e.async.js'],
        depot: ['depot.4d5989ce.js', 'depot.30c54e86.css'],
      }),
    ).toEqual({
      'a.js': 'a.1816b15e.async.js',
      'depot.js': 'depot.4d5989ce.js',
      'depot.css': 'depot.30c54e86.css',
    });
  });
});
