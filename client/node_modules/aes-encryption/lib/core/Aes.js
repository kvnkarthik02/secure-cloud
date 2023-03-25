'use strict'

const crypto = require('crypto')

function Aes() {
  this.secretKey = Math.random().toString()
  this.secretBuffer = null
}

Aes.prototype.setSecretKey = function setSecretKey(secretKeyInput) {
  if (!secretKeyInput || typeof secretKeyInput !== 'string') {
    throw new Error('setSecretKey must be called with a valid string')
  }

  this.secretKey = secretKeyInput
  this.secretBuffer = Buffer.from(this.secretKey, 'hex')
}

Aes.prototype.encrypt = function encrypt(textPlain, secretKeyInput) {
  if (!this.secretBuffer) {
    throw new Error('secretKey is not set, please set secretKey by calling setSecretKey function')
  }

  let cipher = crypto.createCipheriv('aes-256-ecb', this.secretBuffer, '')
  let cipherText = cipher.update(textPlain, 'utf8', 'hex')
  cipherText += cipher.final('hex')
  return cipherText
}

Aes.prototype.decrypt = function decrypt(textEncrypted, secretKeyInput) {
  if (!this.secretBuffer) {
    throw new Error('secretKey is not set, please set secretKey by calling setSecretKey function')
  }

  const cipher = crypto.createDecipheriv('aes-256-ecb', this.secretBuffer, '')
  let decryptedString = cipher.update(textEncrypted, 'hex', 'utf8')
  decryptedString += cipher.final('utf8')
  return decryptedString
}

module.exports = Aes
