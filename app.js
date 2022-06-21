require('dotenv').config();
const express = require('express');
const status = require('http-status');
const app = express();

const { init } = require('./db');

app.use(express.json());

// init().then(() => {
    app.get('/heartbeat', (req, res) => {
        res.send(new Date());
    })
    app.listen(process.env.PORT, () => console.log('Server runnig'));
// })

