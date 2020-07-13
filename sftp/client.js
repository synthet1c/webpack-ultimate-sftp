const fs = require('fs')
const SSH2Client = require('ssh2-sftp-client')
const PromisePool = require('es6-promise-pool')
const { magenta, blue, red, white, gray } = require('chalk')
const { trace, unixify, tap } = require('../libs/utils')

class Client {

  constructor(config) {

    this.config = config
    this.connection = new SSH2Client()
  }

  uploadFiles(files, cbEachFile) {
    this.filePad = files.reduce((a, b) => (a.length > b.filename.length) ? a : b.filename, '').length
    return new Promise((resolve, reject) => {
      this.connection
        .connect(this.config)
        .then(() => {
          let count = 0
          const promiseProducer = files => () => {
            const file = files.shift()
            if (file) return this.uploadFile(file, cbEachFile)
          }
          const pool = new PromisePool(promiseProducer(files.slice()), this.config.connections)
          return pool.start()
        })
        .then(() => this.connection.end())
        .then(resolve)
        .catch(reject)
    })
  }

  uploadFile(file, cb) {
    const { source, destination, content, filename } = file
    return new Promise((resolve, reject) => {
      this.connection.put.call(this.connection, content, unixify(destination))
        .then(trace(`Uploaded`))
        .then(tap(msg => cb(file, msg)))
        .then(resolve)
        .catch(reject)
    })
  }

}

module.exports = Client