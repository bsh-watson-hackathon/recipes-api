'use strict';

const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const async = require('async');

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

  getRecipeMetadata(recipeId, callback) {
    if (!recipeId) {
      throw new Error('Recipe ID is missing...');
    }

    this.recipesMetadata.findOne({ identifier: recipeId }, (err, recipeMeta) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, recipeMeta);
    });
  },

  getRecipeDetail(recipeId, callback) {
    if (!recipeId) {
      throw new Error('Recipe ID is missing...');
    }

    // TODO add en for locale to query
    this.recipesDetails.findOne({ identifier: recipeId }, (err, recipeDetails) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, recipeDetails);
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

    this.recipesDetails.updateOne({ identifier: recipeId, locale: locale }, { $set: { [queryField]: value } }, (err, result) => {
      if (err) {
        console.log(err);
        callback(err);
        return;
      }
      callback(null, result);
    });
  },

  getIngredientsAmount(recipes_id, ingredient_item_param, callback) {
      if (!ingredient_item_param) {
        throw new Error('Item parameter is missing...');
      }

      this.recipesDetails.findOne({ identifier: recipes_id }, (err, recipeDetails) => {
        if (err) {
          callback(err);
          return;
        }
        console.log('recipesdetail found one');

        var ret_val = [];
        async.each(recipeDetails.ingredients_lists, (ingredient_container, callbackIL) => {
          async.each(ingredient_container.ingredients, (ingredients_item, callbackIngItem) => {
            ingredients_item = ingredients_item.toLowerCase();
            ingredient_item_param = ingredient_item_param.toLowerCase();
            console.log('ingredients_item ' + ingredients_item);
            if(ingredients_item.includes(ingredient_item_param)) {
              console.log('maaatch ');
              var obj = {"name":ingredient_container.name, "value":ingredients_item};
              ret_val.push(obj);
            }
          })
        });

        callback(null, ret_val);
      });
    },
};

module.exports = database;