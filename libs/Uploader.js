const { magenta, blue, red, white, gray } = require('chalk')
const logSymbols = require('log-symbols')
const { join } = require('./utils')
const fs = require('fs')

class Uploader {

  constructor(config = {}) {
    this.config = config
    this.init()
  }

  // create concurrent uplaods using PromisePool
  uploadFiles(files) {
    return this.client.uploadFiles(this.filterFiles(files), ({ filename, destination }) => {
      console.log(`${logSymbols.success} ${gray('[wus]')}: ${blue(filename.padStart(this.filePad, ' '))} => ${white(destination)}`)
    })
  }

  filterFiles(files) {
    this.filePad = files.reduce((a, b) => (a.length > b.filename.length) ? a : b.filename, '').length
    return files.reduce((acc, file) => {
      const { source, filename } = file
      // skip ignored file patterns
      const ignoreRule = this.config.ignore.find(rule => source.match(rule))
      if (ignoreRule) {
        console.log(`${red(logSymbols.warning)} ${gray('[wus]')}: ${gray(filename.padStart(this.filePad, ' '))} => ${gray('ignore')} ${gray(ignoreRule)}`)
        return acc
      }
      // don't deploy hot-update files
      if (source.match('hot-update')) {
        return acc
      }
      // if file doesn't exist don't deploy it
      if (!fs.existsSync(source)) {
        console.log(`${red(logSymbols.warning)} ${red('[wus]')}: ${gray(filename.padStart(this.filePad, ' '))} => ${gray('file does not exist')}`)
        // return acc
      }
      return acc.concat(file)
    }, [])
  }

  _uploadFiles = files => new Promise((resolve, reject) => {
    const filePad = files.reduce((a, b) => (a.length > b.filename.length) ? a : b.filename, '').length
    console.log(`${logSymbols.success} ${gray('[wus]')}: ${blue('Uploading files')}`)
    const _uploadFiles = files => {
      if (!files.length) resolve()
      const {size, filename, content, stats} = files.shift()
      const destination = join(this.config.remotePath, filename)
      // skip ignored file patterns
      if (filename.match('hot-update'))
        return _uploadFiles(files)

      const ignoreRule = this.config.ignore.find(ignore => filename.match(ignore))
      if (ignoreRule) {
        console.log(`${logSymbols.warning} ${gray('[wus]')}: ${gray(filename.padStart(filePad, ' '))} => ${gray('ignore')} ${gray(ignoreRule)}`)
        return _uploadFiles(files)
      }
      this.upload({ size, destination, content, stats })
        .then(() => {
          console.log(`${blue('u')} ${gray('[wus]')}: ${blue(filename.padStart(filePad, ' '))} => ${white(destination)}`)
          _uploadFiles(files)
        })
        .catch(reject)
    }
    _uploadFiles(files)
  })

  // init = () => throw new Error('You must define an init method')

  // upload = () => throw new Error('You must define an upload method')

}

module.exports = Uploader