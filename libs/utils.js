const crypto = require('crypto')
const path = require('path')
const glob = require('glob')

exports.md5 = (content) =>
  crypto.createHash('md5').update(content).digest('hex')

exports.unixify = filepath => filepath.replace(/\\/g, '/')

exports.join = (...filePaths) => exports.unixify(path.join(...filePaths))

exports.resolve = (...filePaths) => exports.unixify(
  path.resolve(...filePaths)
    ? path.resolve(...filePaths)
    : path.join(...filePaths)
)

exports.tap = fn => x => (fn(x), x)

exports.trace = tag => x => process.env.DEBUG
  ? (console.log(`webpack-ultimate-sftp:${tag}`, x), x)
  : x

exports.collectFiles = function collectFiles(patterns, files = []) {
  return new Promise((resolve, reject) => {
    function _collectFiles(patterns, files) {
      glob(patterns.shift(), { cwd }, (err, _files) => {
        if (patterns.length) {
          _collectFiles(patterns, files.concat(_files))
        } else {
          resolve(files.concat(_files))
        }
      })
    }
    _collectFiles(patterns, files)
  })
}
