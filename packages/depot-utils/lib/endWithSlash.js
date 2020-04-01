export default function endWithSlash(path) {
  return path.slice(-1) !== '/' ? ''.concat(path, '/') : path;
}
