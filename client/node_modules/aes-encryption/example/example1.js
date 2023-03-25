const AesEncryption = require('../index')

const aes = new AesEncryption()
aes.setSecretKey('11122233344455566677788822244455555555555555555231231321313aaaff')

const encrypted = aes.encrypt('some-plain-text')
const decrypted = aes.decrypt(encrypted)

console.log('encrypted >>>>>>', encrypted)
console.log('decrypted >>>>>>', decrypted)
