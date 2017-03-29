'use strict';

const bodyParser = require('body-parser'),
  express = require('express');

const routes = require('./routes');

const app = (dbMongo, dbCloudant) => {
  const app = express();
  app.use(bodyParser.json());

  app.get('/recipesmetadata', routes.getRecipesMetadata(dbMongo, dbCloudant));
  app.get('/recipesmetadata/:identifier/:_select?', routes.getRecipeMetadata());
  app.get('/recipes/:identifier/:_select?', routes.getRecipe());

  return app;
};

module.exports = app;