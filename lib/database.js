'use strict';

const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

const database = {
  initialize(connectionString, callback) {
    MongoClient.connect(connectionString, { autoReconnect: true }, (err, database) => {
      if (err) {
        return callback(err);
      }

      console.log("MongoDB: Connected successfully to server");

      const recipes = database.collection('recipes');
      const recipesmetadata = database.collection('recipemetadata');

      this.recipes = recipes;
      this.recipesmetadata = recipesmetadata;
      callback(null);
    });
  }
};

module.exports = database;