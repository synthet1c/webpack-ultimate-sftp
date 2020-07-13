const fs = require('fs')
const path = require('path')
const glob = require('glob')
const Client = require('../sftp/client')
const { join, trace, resolve, unixify, collectFiles } = require('../libs/utils')

class Plugin {

  constructor({
    protocol = 'sftp',
    connections = 6,
    port = 22,
    host,
    username,
    password,
    localPath: cwd = process.cwd(),
    remotePath,
    privateKey,
    passphrase,
    files,
    ignore = [],
  } = {}) {

    if (!host) {
      throw new Error(`You must specify a host`)
    }

    if (!username) {
      throw new Error(`You must specify a username`)
    }

    if (!password && !privateKey) {
      throw new Error(`You must specify either a privateKey or password`)
    }

    this.config = {
      cwd,
      port,
      host,
      remotePath,
      connections,
      username,
      ...(ignore && Array.isArray(ignore) ? { ignore } : { ignore: [ignore] }),
      ...(password && { password }),
      ...(passphrase && { passphrase }),
      ...(privateKey && {
        privateKey: fs.existsSync(privateKey)
          ? fs.readFileSync(privateKey, 'utf-8')
          : privateKey
      })
    }

    switch (this.config.protocol) {
      default:
        case 'sftp': this.Uploader = require('../libs/sftp'); break
    }

    this.client = new this.Uploader(this.config)
    this.client.init()
  }

  collectFiles(files) {
    return collectFiles(files)
      .then(files => files.map(source => ({
        source: unixify(path.resolve(cwd, source)),
        destination: join(remotePath, source)
      })))
      .then(trace('files'))
      .then(this.client.uploadFiles.bind(this._client))
  }
}

module.exports = Plugin