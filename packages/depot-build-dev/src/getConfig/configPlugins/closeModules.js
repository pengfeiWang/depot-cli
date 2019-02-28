import assert from 'assert';

export default function(api) {
  return {
    name: 'closeModules',
    validate(val) {
      assert(
        Array.isArray(val),
        `Configure item outputPath should be Function, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Configure item chainWebpack Changed.');
    },
  };
}
