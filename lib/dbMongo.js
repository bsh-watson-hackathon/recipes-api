'use strict';

const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

// Use always english to retrive entries form db
const locale = "en";

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
      throw new Error('Recipe details is missing');
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
      throw new Error('Recipe metadata is missing');
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
  },

  updateRecipeStep(recipeId, stepIndex, field, value, callback) {
    let queryField = "steps." + stepIndex + "." + field;

    this.recipesDetails.updateOne( { identifier: recipeId, locale: locale }, { $set: { [queryField]: value } }, (err, result) => {
      if (err) {
        console.log(err);
        callback(err);
        return;
      }
      callback(null, result);
    });
  }
};

module.exports = database;