const express = require('express');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const app = express();
const path = require('path');

app.use(cors())

app.use(express.static(path.join(__dirname, 'views')))

app.get('/', (req, res) => {
    res.sendFile('views/client.html', {root: __dirname })
});

app.post('/download', (req, res) => {
    //get public key from server
    var response = axios.post('http://localhost:1234/publickey', {}
    ).then(function (response) {
        console.log(response.data);
        //decode base64 public key that we received from server
        // let buff = new Buffer(response.data, 'base64');
        let text = Buffer.from(response.data, 'base64');
        let publickey = `-----BEGIN PUBLIC KEY-----\n${text.toString('base64')}\n-----END PUBLIC KEY-----\n`;

        let downloadFile= req.headers.filename;
        let username = req.headers.username;
    
        let encryptedFile = crypto.publicEncrypt({
            key: publickey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
            Buffer.from(downloadFile)
        );

        let encryptedUsername = crypto.publicEncrypt({
            key: publickey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
            Buffer.from(username)
        );

        const rsaPublicKey = fs.readFileSync(path.resolve(__dirname, './keys/rsa_public_key.pem'));
        const encodedRsaPublickey = Buffer.from(rsaPublicKey).toString('base64');

        let newResponse = axios.post('http://localhost:1234/publickey', {
            publicKey:encodedRsaPublickey,
            filename: encryptedFile,
            auth: encryptedUsername
        }).then(function (response) {
            

        }).catch(function (error) {
            console.log(error);
        });


    }).catch(function (error) {
        console.log(error);
    });

    






});


app.listen(4321, () => {
    console.log('Server listening on port 4321!');
});

