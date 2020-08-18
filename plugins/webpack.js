const Plugin = require('./Plugin')
const path = require('path')
const logSymbols = require('log-symbols')
const { md5, trace, join, resolve, unixify } = require('../libs/utils')
const cache = {}
const { red, gray } = require('chalk')

class WebpackPlugin extends Plugin {

  apply(compiler) {
    if (compiler.hooks) {
      compiler.hooks.done.tapPromise('upload-plugin', this.handleEvent)
    }
    else {
      compiler.plugin("done", this.handleEvent);
    }

  }

  handleEvent = (stats) => {
    return this.client.uploadFiles(trace('getFiles')(this.getFiles(stats)))
      .catch(err => {
        console.log(`${logSymbols.error} ${gray('[uup]')} ${err.message}`)
        process.exit()
        throw new Error(err)
      })
  }

  getFiles = stats =>
    Object.keys(stats.compilation.assets).reduce((acc, filename) => {

      const file = stats.compilation.assets[filename]
      const source = file.source()
      const hash = md5(source)
      const cacheHash = cache[filename]

      if (cacheHash === hash) return acc

      cache[filename] = hash

      return acc.concat({
        size: file.size(),
        source: resolve(this.config.cwd, filename),
        destination: join(this.config.remotePath, filename),
        filename,
        content: Buffer.from(source),
        stats: {}
      })

    }, [])

}

module.exports = WebpackPlugin