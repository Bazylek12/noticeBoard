require('dotenv').config();
const express = require('express');
const status = require('http-status');
const app = express();

const { init, getAds, getAd, deleteAd, addAd, updateAd } = require('./db');

app.use(express.json());

init().then(() => {
    app.get('/ads', async (req, res) => {
        const ads = await getAds()
        if (ads.length !== 0) {
            res.send(ads);
        }
        res.statusCode = status.NO_CONTENT;
        res.send();
    });

    app.get('/ads/:id', async (req, res) => {
        const { id } = req.params;
        const ad = await getAd(id);
        if (ad) {
            res.send(ad);
        }
        res.statusCode = status.NOT_FOUND;
        res.send();
    })

    app.post('/ads', async (req, res) => {
        const newAd = req.body;
        const result = await addAd(newAd);
        if (!newAd.title || !newAd.description || !newAd.author || !newAd.tags || !newAd.category || !newAd.price) {
            res.statusCode = status.BAD_REQUEST;
            res.send("Wrong data passed " + res.statusCode)
        } else if (result.insertedCount === 1) {
            res.statusCode = status.CREATED;
            res.send("New ad created" + res.statusCode);
        } else {
            res.statusCode = status.INTERNAL_SERVER_ERROR;
            res.send("Error: " + res.statusCode)
        }
    })

    app.delete('/ads/:id', async (req, res) => {
        const { id } = req.params;
        const result = await deleteAd(id);
        if (result.deletedCount === 1) {
            res.statusCode = status.NO_CONTENT;
            res.send("Ad deleted. " + res.statusCode);
        } else {
            res.statusCode = status.NOT_FOUND;
            res.send("Error " + res.statusCode)
        }
    })

    app.patch('/ads/:id', async (req, res) => {
        const { id } = req.params;
        const modified = req.body;
        if (modified == null) {
            res.statusCode = status.BAD_REQUEST;
            res.send("Bad data. Error: " + res.statusCode);
        } else {
            const result = await updateAd(id, modified);
            if (result.modifiedCount === 1) {
                res.statusCode = status.ACCEPTED;
                res.send("Ad updated. Code: " + res.statusCode);
            } else if (result.matchedCount === 1) {
                res.statusCode = status.CONFLICT;
                res.send("Nothing to update. Make some changes. Error: " + res.statusCode);
            } else {
                res.statusCode = status.NOT_FOUND;
                res.send("Ad doesn't exist. Error: " + res.statusCode);
            }
        }
    });
})

    .finally(() => {
        app.get('/heartbeat', (req, res) => {
            res.send(new Date());
        })
        app.listen(process.env.PORT, () => console.log('Server runnig'));
    })

