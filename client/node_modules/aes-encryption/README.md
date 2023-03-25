# aes-encryption

Encryption and decryption utils and handlers for aes-256-ecb (ECB modes of operation, hex encoding) 

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

Using npm:

```bash
$ npm install aes-encryption
```

Using yarn:

```bash
$ yarn add aes-encryption
```

## Features

  * AES-256 encryption
  * AES-256 decryption

------

## Usage

```js
const AesEncryption = require('aes-encryption')

const aes = new AesEncryption()
aes.setSecretKey('11122233344455566677788822244455555555555555555231231321313aaaff')
// Note: secretKey must be 64 length of only valid HEX characters, 0-9, A, B, C, D, E and F

const encrypted = aes.encrypt('some-plain-text')
const decrypted = aes.decrypt(encrypted)

console.log('encrypted >>>>>>', encrypted)
console.log('decrypted >>>>>>', decrypted)
```


## License

  [MIT](LICENSE)

---

#### *Created by CODEMONDAY's Developers Team*
