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

      const recipesDetails = database.collection('recipes.details.ext');
      const recipesMetadata = database.collection('recipes.metadata.ext');

      this.recipesDetails = recipesDetails;
      this.recipesMetadata = recipesMetadata;
      callback(null);
    });
  },

  saveRecipeDetails(recipeDetails, callback) {
    if (!recipeDetails) {
      throw new Error('recipe is missing');
    }
    if (!callback) {
      throw new Error('Callback is missing');
    }

    this.recipesDetails.insertOne(recipeDetails, (err, result) => {
      if (err) {
        return callback(err);
      }

      callback(null, result);
    });
  },

  saveRecipeMetadata(recipeMetadata, callback) {
    if (!recipeMetadata) {
      throw new Error('recipeMetadata is missing');
    }
    if (!callback) {
      throw new Error('Callback is missing');
    }

    this.recipesMetadata.insertOne(recipeMetadata, (err, result) => {
      if (err) {
        return callback(err);
      }

      callback(null, result);
    });
  }
};

module.exports = database;