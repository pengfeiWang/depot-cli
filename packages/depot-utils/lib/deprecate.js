var isWindows = typeof process !== 'undefined' && process.platform === 'win32';
var EOL = isWindows ? '\r\n' : '\n';
var hits = {};
export default function deprecate(methodName) {
  if (hits[methodName]) return;
  hits[methodName] = true;
  var stream = process.stderr;
  var color = stream.isTTY && '\x1b[31;1m';
  stream.write(EOL);

  if (color) {
    stream.write(color);
  }

  stream.write("Warning: ".concat(methodName, " has been deprecated."));
  stream.write(EOL);

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  args.forEach(function (message) {
    stream.write(message);
    stream.write(EOL);
  });

  if (color) {
    stream.write('\x1b[0m');
  }

  stream.write(EOL);
  stream.write(EOL);
}