const express = require('express');
const cors = require('cors');
const app = express();
const crypto = require('crypto');
const AesEncryption = require('aes-encryption');
const aes = new AesEncryption();
const fs = require('fs');
const path = require('path');

app.use(cors())
app.use(express.static(path.join(__dirname, 'views')))
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile('views/server.html', {root: __dirname })
    // res.render('server.html');    //works only for non html templates
});

app.post('/upload', (req, res) => {
  console.log(req.body.fileName);
  let aesKey = req.body.aesKey;
  let buff = Buffer.from(aesKey);
  aesKey = buff.toString('ascii');

  let rsaPrivKeyServer = fs.readFileSync(path.resolve(__dirname, './access/rsaprivateServer.pem'), 'utf8');

  const decryptedAesKey = crypto.privateDecrypt(
    {
      key: rsaPrivKeyServer,
      // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(aesKey, "base64")
  );

  aes.setSecretKey(decryptedAesKey.toString('ascii'));
  let ciphertext = req.body.ct;
  ciphertext = aes.decrypt(ciphertext);

  let aeskeyServer = fs.readFileSync(path.resolve(__dirname, './access/aeskeyServer.pem'), 'utf8');
  aes.setSecretKey(aeskeyServer);
  ciphertextForServerStorage = aes.encrypt(ciphertext);  //bad variable name


  fs.writeFile('./uploadedFiles/'+req.body.fileName, ciphertextForServerStorage, function (err){
    if (err){
      return res.status(400).send("Upload Failed.")
    };
    console.log('File is uploaded successfully.');
    return res.status(200).send('File is uploaded successfully.');
  });    
});


//return server's public key
app.get('/publickey', (req, res) => {
    let rsapublicServer = fs.readFileSync(path.resolve(__dirname, './access/rsapublicServer.pem'), 'utf8');
    return res.send(rsapublicServer); 
}) 


app.listen(1234, () => {
    console.log('Server listening on port 1234!');

    //uncomment the following code if you want to generate a new set of AES and RSA pub/priv keys

    // const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
    //     modulusLength: 2048,
    // });

    // const exportedPublicKeyBuffer = publicKey.export({
    //     type: "pkcs1",
    //     format: "pem",
    //   });
    //   fs.writeFileSync("access/rsapublicServer.pem", exportedPublicKeyBuffer, { encoding: "utf-8" });

    // const exportedPrivateKeyBuffer = privateKey.export({
    //   type: "pkcs1",
    //   format: "pem",
    // });
    // fs.writeFileSync("access/rsaprivateServer.pem", exportedPrivateKeyBuffer, {
    //   encoding: "utf-8",
    // });

    // let aesKey = crypto.randomBytes(32).toString('hex');
    // fs.writeFileSync("access/aeskeyServer.pem", aesKey, {
    //     encoding: "utf-8",
    //   }); 

});

