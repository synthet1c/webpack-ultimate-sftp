# Webpack Ultimate SFTP

This plugin allows you to upload you package to your server using SFTP. The plugin accepts either a password or ssh private key as authentication.

To speed up the process of uploading, multiple connections are used which you can control in your configuration if your server does not support this feature.

```bash
npm install webpack-ultimate-sftp
```

```javascript
const WebpackUltimateSftp = require('webpack-ultimate-sftp')
module.exports = {
  // ...webpack config
  plugins: [
    // ...other plugins
    new WebpackUltimateSftp({
      host: 'Your IP address',
      username: process.env.USERNAME || process.env.USER,
      privateKey: `${process.env.USERPROFILE || process.env.HOME}/.ssh/id_rsa`,
    })
  ] 
}
```

## params

| name | type | description | required | default |
|:--- |:--- |:--- |:--- |:--- |
| `connections` | `Number` | concurrent connections to open | optional | `8` |
| `host` | `string` | remote server host (ip address) | no | `null` |
| `username` | `string` | Authorized username | required | system username |
| `password` | `string` | Authorized user password | either password or private key | system username |
| `privateKey` | <code>string&#124;Buffer</code> | Private key path or Buffer | either password or private key | system profile id_rsa |
| `passphrase` | `string` | private key passphrase | optional | `null` |
| `localPath` | `string` | local path deployment root | optional | `./` |
| `remotePath` | `string` | remote path deployment root | optional | `./` |
| `ignore` | <code>string&#124;Regex</code> | patterns to skip uploading, can be inside an array | optional | `./` |

## example 
```javascript
new WebpackUltimateSftp({
  connections: 8,
  host: 'remote.server.host',
  username: 'username',
  password: 'password',
  privateKey: `${process.env.USERPROFILE || process.env.HOME}/.ssh/id_rsa`,
  passphrase: 'passphrase',
  localPath: path.resolve(__dirname, './dist'),
  remotePath: '/path/to/remote/dist',
  ignore: [
    /fonts/ 
  ]
})
```