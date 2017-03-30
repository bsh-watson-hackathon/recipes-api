'use strict';

const bodyParser = require('body-parser'),
  express = require('express');

const routes = require('./routes');

const app = (dbMongo, dbCloudant) => {
  const app = express();
  app.use(bodyParser.json());

  app.get('/recipesmetadata', routes.getRecipesMetadata(dbMongo, dbCloudant));
  app.get('/recipesmetadata/:identifier', routes.getRecipeMetadata(dbMongo));
  app.get('/recipesdetail/:identifier', routes.getRecipeDetail(dbMongo));
  app.put('/recipesdetail/:identifier/steps/:stepIndex/:field', routes.updateStep(dbMongo));

  return app;
};

module.exports = app;