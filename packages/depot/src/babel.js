export default function(context, opts = {}) {
  return {
    presets: [
      [
        require.resolve('depot-babel-preset'),
        {
          ...opts,
          preact: true,
        },
      ],
    ],
  };
}
