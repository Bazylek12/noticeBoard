const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');

const URL = process.env.MONGODB_CONNECTION;

const AdsCollectionName = 'ads';

let db;
let adsCollection;

const init = () => {
    MongoClient.connect(URL, { useUnifiedTopology: true, useNewUrlParser: true })
        .then((client) => {
            db = client.db(process.env.MONGODB_DBNAME)
            adsCollection = db.collection(AdsCollectionName)
        })
        .catch(error => console.log(error));
}

module.exports = { init }