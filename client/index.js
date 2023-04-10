const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
//set aes encryption 
const AesEncryption = require('aes-encryption');
const aes = new AesEncryption();
let aeskey = fs.readFileSync(path.resolve(__dirname, './access/aeskey.pem'), 'utf8');
aes.setSecretKey(aeskey);

const axios = require('axios');
const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname + '/views/login')))
app.use(express.static(path.join(__dirname + '/views')))
app.use(express.json());

//default route
app.get('/', (req, res) => {
    res.sendFile('views/login/login.html', {root: __dirname })
});

//route once username is validated
app.get('/client', (req, res) => {
    res.sendFile('views/client.html', {root: __dirname })
});

//route which validates username
app.get('/validate', (req, res) => {
    try{
        let username =  req.headers.username;
        console.log(username);
        fs.readFile("./validUsernames.json", "utf8", (err, jsonString) => {
            if (err) {
              console.log("File read failed:", err);
              return;
            }
            console.log("File data:", jsonString);
            if(jsonString.includes(username)){
                console.log("Valid usernames");
                return res.status(200).send("Valid");
            }else{
                console.log("Invalid usernames");
                return res.status(404).send("Invalid");
            }
          });
    }catch(err){
        console.log(err);
    }
});


//route which handles the client side of a file upload
app.post('/upload', (req, res) => {
    new formidable.IncomingForm().parse(req)
    .on('file', async (name, file) => {
        // console.log('Uploaded file: ', file.originalFilename);

        //get public key from server
        let response = await axios.get('http://localhost:1234/publickey', {});
        let serverPublicKey = response.data;

        let fileName = file.originalFilename;
        unencryptedFile = fs.readFileSync(file.filepath);     

        cipher = aes.encrypt(unencryptedFile);
            
        let encryptedAesKey = crypto.publicEncrypt({
            key: serverPublicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
            Buffer.from(aeskey) 
        );          

        let buffer = Buffer.from(encryptedAesKey);
        let base64AesKey = buffer.toString('base64');
        
        axios.post('http://localhost:1234/upload', {
            "fileName": fileName,
            "ct": cipher,
            "aesKey": base64AesKey
        }).then(function (response) {
            console.log(response.data);
            if(response.statusCode === 200){
                res.statusCode = 200;
            }else{
                res.statusCode = 400;
            }
        }).catch(function (error) {
            console.log(error); 
        });
      })  
});    

app.post('/download', async (req, res) => {
    let downloadFile = req.body.file;

    let response = await axios.get('http://localhost:1234/publickey', {});
    let serverPublicKey = response.data;

    let encryptedFilename = crypto.publicEncrypt({
        key: serverPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    },
        Buffer.from(downloadFile)
    );

    let buff = Buffer.from(encryptedFilename);
    let base64FileName = buff.toString('base64');

    response = await axios.post('http://localhost:1234/download', {
        "fileName": base64FileName,
    });

    let aesKey = response.data.aesKey;
    let fileName = response.data.fileName;
    let fileContents = response.data.fileContents;

    aes.setSecretKey(aesKey); 
    fileContents = aes.decrypt(fileContents);

    fs.writeFile('./downloadFiles/'+fileName, fileContents, function (err){
        if (err){
          return res.status(400).send("Upload Failed.")
        };
        console.log('File is downloaded to client successfully.');
        return res.status(200).send('File is downloaded to client successfully.');
    });  
});  
 
app.post('/remove', async (req, res) => {
    let response = await axios.get('http://localhost:1234/publickey', {});
    let serverPublicKey = response.data;

    let removeFile = req.body.file;

    encryptedFileName = crypto.publicEncrypt({
        key: serverPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    },
        Buffer.from(removeFile)
    );

    let buff = Buffer.from(encryptedFileName);
    let base64FileName = buff.toString('base64');

    axios.post('http://localhost:1234/remove', {
            "fileName": base64FileName,
        }).then(function (response) {  
            console.log(response.data);
            if(response.statusCode === 200){
                res.statusCode = 200;
            }else{
                res.statusCode = 400;
            }
        }).catch(function (error) {
            console.log(error);
    });
})

//return client's public key
app.get('/publickey', (req, res) => {
    let rsapublicClient= fs.readFileSync(path.resolve(__dirname, './access/rsapublic.pem'), 'utf8');
    return res.send(rsapublicClient); 
}) 
     
app.listen(4321, () => {
    console.log('Client listening on port 4321!');
    // const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
    //     modulusLength: 2048,
    // });

    // const exportedPublicKeyBuffer = publicKey.export({
    //     type: "pkcs1",
    //     format: "pem",
    //   });
    //   fs.writeFileSync("access/rsapublic.pem", exportedPublicKeyBuffer, { encoding: "utf-8" });

    // const exportedPrivateKeyBuffer = privateKey.export({
    //   type: "pkcs1",
    //   format: "pem",
    // });
    // fs.writeFileSync("access/rsaprivate.pem", exportedPrivateKeyBuffer, {
    //   encoding: "utf-8",
    // }); 

    // let aesKey = crypto.randomBytes(32).toString('hex');
    // fs.writeFileSync("access/aeskey.pem", aesKey, {
    //     encoding: "utf-8",
    //   });
});
