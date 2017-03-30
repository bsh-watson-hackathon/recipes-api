'use strict';

const request = require('request'),
  async = require('async');

const updateRecipe = (dbMongo) => {

  return (req, res) => {
    let recipeId = req.params.identifier;
    let stepIndex = req.params.stepIndex;
    let field = req.params.field;
    let value = req.body.value;
    
    // check if the recipe is from BSH recipes or from external source
    let startIndex = 0;
    let endIndex = recipeId.indexOf('_');
    let idPrefix = recipeId.substring(startIndex, endIndex);

    console.log('Prefix to compare: ' + idPrefix);

    // recipe from external source
    if (idPrefix === 'ext') {
      console.log('Updating step in external recipe...');

      updateExternalRecipeStep(dbMongo, recipeId, stepIndex, field, value, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).end();
        }

        console.log('Recipe step successfully updated!');
        res.sendStatus(200);
      });
    } else {
      console.log('Updating step in BSH recipe...');
      // TODO: Call BSH recipe service to update the given step
    }
  }
};

const updateExternalRecipeStep = (dbMongo, recipeId, stepIndex, field, value, callback) => {
  dbMongo.updateRecipeStep(recipeId, stepIndex, field, value, (err, result) => {
    if (err) {
      console.log(err);
      callback(err);
      return;
    }
    callback(null, result);
  });
};

module.exports = updateRecipe;