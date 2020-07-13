const Client = require('../sftp/client')
const Uploader = require('./Uploader')
const { trace } = require('../libs/utils')

class Sftp extends Uploader {

  init() {
    return new Promise((resolve, reject) => {
      this.client = new Client(this.config)
    })
  }

  upload(file) {
    return this.client.uploadFile(file)
  }
}



module.exports = Sftp

