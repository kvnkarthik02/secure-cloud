const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

app.use(cors())

app.use(express.static(path.join(__dirname, 'views')))

app.get('/', (req, res) => {
    res.sendFile('views/server.html', {root: __dirname })
    // res.render('server.html');    //works only for non html templates
});


app.get()


app.listen(1234, () => {
    console.log('Server listening on port 1234!');
});

