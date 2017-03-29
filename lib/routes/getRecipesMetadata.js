'use strict';

const request = require('request');

const getRecipesMetadata = () => {

  return (req, res) => {

    console.log('Recipe title: ' + req.query.title);
    console.log('Uset ID: ' + req.query.userId);

    if (req.query.title) {

      // call BSH recipe API
      callBshRecipeService(req.query.title, (err, recipes) => {
        if (err) {
          console.log(err);
          res.status(500).end();
        }

        if (!recipes) {
          res.status(404).end();
        } else if (recipes.length > 0) {
          console.log('Found ' + recipes.length + ' recipes...');
          res.send(recipes);
        } else if (recipes.length == 0) {
          console.log('No recipes found in BSH service');
          console.log('Looking in external service...');

          // call exterlna recipe API
          callExternalRecipeService(req.query.title), (err, recipes) => {
            if (err) {
              console.log(err);
              res.status(500).end();
            }

            if (!recipes) {
              res.status(404).end();
            } else {
              console.log('Found ' + recipes.length + ' recipes...');
              res.send(recipes);
            }
          }
        }
      });
    }
  };
};

const callBshRecipeService = (recipeTitle, callback) => {
  var options = {
    method: 'GET',
    url: 'https://bshrecipes.mybluemix.net/recipesmetadata',
    qs: { title: recipeTitle }
  };

  request(options, (error, response, body) => {
    let statusCode = response.statusCode;

    if (error) {
      console.log(error);
      callback(error);
      return;
    }

    if (statusCode === 200) {
      let recipes;
      try {
        recipes = JSON.parse(body);
      } catch (e) {
        logger.error(e.message);
        return;
      }

      callback(null, recipes);
    }
  });
}

const callExternalRecipeService = (recipeTitle, callback) => {
  // TODO implement for requesting recipe from external service
  console.log('Requesting external service...');

  // var options = {
  //   method: 'GET',
  //   url: 'https://bshrecipes-external.mybluemix.net/recipes',
  //   qs: { title: recipeTitle }
  // };

  // request(options, (error, response, body) => {
  //   let statusCode = response.statusCode;

  //   if (error) {
  //     console.log(error);
  //     callback(error);
  //     return;
  //   }

  //   if (statusCode === 200) {
  //     let recipes;
  //     try {
  //       recipes = JSON.parse(body);
  //     } catch (e) {
  //       logger.error(e.message);
  //       return;
  //     }

  //     let fullRecipes = {
  //       recipesMetadata: recipes.metadata,
  //       recipesDetails: recipes.details
  //     }

  //     callback(null, recipes);
  //   }
  // });
}

module.exports = getRecipesMetadata;