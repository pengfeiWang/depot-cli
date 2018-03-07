import Service from './Service';

export default function build(opts = {}) {
  const o = {}
  const service = new Service(opts.cwd, opts);
  // assaa eslint test
  return service.build()

}
