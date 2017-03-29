'use strict';

const Cloudant = require('cloudant');

const dbCloudant = {
    initialize(connectionString, callback) {
        if (!connectionString) {
            throw new Error('Connection string is missing.');
        }

        if (!callback) {
            throw new Error('Connection string is missing.');
        }

        const cloudant = Cloudant(connectionString);
        const userdb = cloudant.db.use('userdb');
        this.userdb = userdb;
        callback(null);
    },

    getUser(userName, callback) {

        if (!userName) {
            throw new Error('User name is missing');
        }
        if (!callback) {
            throw new Error('Callback is missing');
        }

        this.userdb.find({ selector: { name: userName.toLowerCase().trim() } }, (err, userentry) => {
            if (err) {
                console.log(err);
                return callback(err);
            }

            let user = userentry.docs[0];
            callback(null, user);
        });
    }
}

module.exports = dbCloudant;