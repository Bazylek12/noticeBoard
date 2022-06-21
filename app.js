require('dotenv').config();
const express = require('express');
const status = require('http-status');
const { redirect } = require('statuses');
const app = express();
const fs = require('fs')

const { init, getAds, getAd, deleteAd, addAd, updateAd, deleteMany } = require('./db');

let debugOn;
if (process.argv[2] == 'debug') {
    debugOn = true;
} else {
    debugOn = false;
};
const saveLogs = (req, res, next) => {
    if (debugOn) {
        const data = new Date() + " " + req.method + " " + req.path;
        const file = 'debug.txt';
        fs.appendFile(file, data + "\n", "utf8", (err) => {
            if (err) {
                throw err;
            }
        });
        next();
    } else {
        next();
    };
};

app.use(express.json(), saveLogs);

init().then(() => {
    app.get('/ads', async (req, res) => {
        const ads = await getAds()
        try {
            if (ads.length !== 0) {
                res.send(ads);
            }
        } catch {
            res.statusCode = status.NO_CONTENT;
            res.send("No ads on notice board. Error: " + res.statusCode);
            console.log("No ads on notice board. Error: " + res.statusCode);
        }
    });

    app.get('/ads/:id', async (req, res) => {
        const { id } = req.params;
        const ad = await getAd(id);
        if (ad) {
            res.send(ad);
        }
        res.statusCode = status.NOT_FOUND;
        res.send("Ad doesn't exist. Code: " + res.statusCode);
        console.log("Ad doesn't exist. Code: " + res.statusCode);
    })

    app.post('/ads', async (req, res) => {
        const newAd = req.body;
        const result = await addAd(newAd);
        try {
            if (!newAd.title || !newAd.description || !newAd.author || !newAd.tags || !newAd.category || !newAd.price) {
                res.statusCode = status.BAD_REQUEST;
                res.send("Wrong data passed " + res.statusCode)
                console.log("Wrong data passed " + res.statusCode)
            } else if (result.insertedCount === 1) {
                res.statusCode = status.CREATED;
                res.send("New ad created" + res.statusCode);
                console.log("New ad created" + res.statusCode)
            }
        } catch {
            res.statusCode = status.INTERNAL_SERVER_ERROR;
            res.send("Error: " + res.statusCode);
            console.log("Error: " + res.statusCode);
        }
    })

    app.delete('/ads/:id', async (req, res) => {
        const { id } = req.params;
        const result = await deleteAd(id);
        if (result.deletedCount === 1) {
            res.statusCode = status.NO_CONTENT;
            res.send("Ad deleted. " + res.statusCode);
            console.log("Ad deleted. " + res.statusCode);
        } else {
            res.statusCode = status.NOT_FOUND;
            res.send("Error " + res.statusCode);
            console.log("Error " + res.statusCode);
        }
    })
    app.delete('/delete', async (req, res) => {
        const result = await deleteMany();
        try {
            if (result) {
                res.statusCode = status.NO_CONTENT;
                res.send(result);
            }
        } catch {
            res.statusCode = status.NOT_FOUND;
            res.send("Error " + res.statusCode);
            console.log("Error " + res.statusCode);
        }
    })

    app.patch('/ads/:id', async (req, res) => {
        const { id } = req.params;
        const modified = req.body;
        if (modified == null) {
            res.statusCode = status.BAD_REQUEST;
            res.send("Bad data. Error: " + res.statusCode);
            console.log("Bad data. Error: " + res.statusCode);
        } else {
            const result = await updateAd(id, modified);
            if (result.modifiedCount === 1) {
                res.statusCode = status.ACCEPTED;
                res.send("Ad updated. Code: " + res.statusCode);
                console.log("Ad updated. Code: " + res.statusCode);
            } else if (result.matchedCount === 1) {
                res.statusCode = status.CONFLICT;
                res.send("Nothing to update. Make some changes. Error: " + res.statusCode);
                console.log("Nothing to update. Make some changes. Error: " + res.statusCode);
            } else {
                res.statusCode = status.NOT_FOUND;
                res.send("Ad doesn't exist. Error: " + res.statusCode);
                console.log("Ad doesn't exist. Error: " + res.statusCode);
            }
        }
    });

    app.get('/heartbeat', (req, res) => {
        res.send(new Date().toString());
    })
})
    .finally(() => {
        app.all('*', (req, res) => {
            res.statusCode = status.NOT_FOUND;
            res.sendFile(__dirname + '/404.png')
        })
        app.listen(process.env.PORT, () => console.log('Server runnig'));
    })

