const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const path = require('path');

app.use(cors())

app.use(express.static(path.join(__dirname, 'views')))

app.get('/', (req, res) => {
    res.sendFile('views/client.html', {root: __dirname })
});

app.post('/download', (req, res) => {
    var response = axios.post('http://localhost:1234/publickey', {}
    ).then(function (response) {
        console.log(response.data);
    }).catch(function (error) {
        console.log(error);
    });
});

app.listen(4321, () => {
    console.log('Server listening on port 4321!');
});

