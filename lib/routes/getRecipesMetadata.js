'use strict';

// npm
const request = require('request'),
  async = require('async');

// private
const recipeMacher = require('../recipeMacher');

const getRecipesMetadata = (dbMongo, dbCloudant) => {

  return (req, res) => {

    let user = null;
    let recipeTitle = req.query.title;
    let userId = req.query.userId;
    console.log('Recipe title: ' + recipeTitle);
    console.log('Uset ID: ' + req.query.userId);

    if (!userId) {
      console.log('UserId is missing...');
    } else {
      dbCloudant.getUser(userId, (err, userentry) => {
        if (err) {
          console.log(err);
          res.status(500).end();
        }
        user = userentry;
        console.log(user);
      });
    }

    if (!recipeTitle) {
      console.log('Recipe title is missing...');
      res.status(400).end();
    } else {
      // call BSH recipe API
      callBshRecipeService(recipeTitle, (err, recipes) => {
        if (err) {
          console.log(err);
          res.status(500).end();
        }

        if (!recipes) {
          res.status(404).end();
        } else if (recipes.length > 0) {
          if (!user) {
            let recipesMeta = [];
            async.each(recipes, (recipeObj, innerCallback) => {
              recipesMeta.push(recipeObj.metadata);
              innerCallback();
            }, (err) => {
              if (err) {
                console.log(err);
              } else {

                 let response = {
                  user: null,
                  foundRecipe: recipesMeta.length,
                  matchingRecipes: recipesMeta
                };
                res.send(response); 
              }
            }); 
          } else {
            // call recipe macher
            console.log('Found ' + recipes.length + ' recipes...');
            recipeMacher(recipes, user, (err, matchedRecipes) => {
              if ( err) {
                console.log(err);
              } else {
                console.log('Matched ' + matchedRecipes.length + ' recipes...');

                let response = {
                  user: user,
                  foundRecipe: recipes.length,
                  matchingRecipes: matchedRecipes
                };
                res.send(response); 
              }
            });
          }
        } else if (recipes.length == 0) {
          console.log('No recipes found in BSH service');
          console.log('Looking in external service...');

          // call exterlna recipe API
          callExternalRecipeService(recipeTitle, (err, recipes) => {
            if (err) {
              console.log(err);
              res.status(500).end();
            }

            if (!recipes) {
              res.status(404).end();
            } else {
              console.log('Found ' + recipes.length + ' recipes...');

              // call recipe macher ================================

              recipeMAcher(recipes, user, (err, matchedRecipes) => {
                // for each recipe object - save recipe metadata and recipe details
                let recipesMetadata = [];
                async.each(matchedRecipes, (recipe, callback) => {
                  saveExternalRecipeObject(dbMongo, recipe, (err) => {
                    if (err) {
                      callback(err);
                      return;
                    }
                    recipesMetadata.push(recipe.metadata);
                    callback(null);
                  });
                }, (err) => {
                  if (err) {
                    console.log('There was a problem saving recipe object: ' + err);
                    res.status(500).end();
                  } else {
                    console.log('External recipe objects have been saved successfully!');
                    res.send(recipesMetadata);
                  }
                });
              });
            }
          });
        }
      });
    }
  };
};

const callBshRecipeService = (recipeTitle, callback) => {
  var options = {
    method: 'GET',
    url: 'https://bshrecipes.mybluemix.net/recipes',
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
  console.log('Requesting external service...');

  var options = {
    method: 'GET',
    url: 'https://bsh-recipe-external.mybluemix.net/recipes',
    qs: { title: recipeTitle }
  };

  request(options, (error, response, body) => {
    let statusCode = response.statusCode;
    console.log('Status code: ' + statusCode);
    console.log('Response: ' + response);
    console.log('Body: ' + body);

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

const saveExternalRecipeObject = (dbMongo, recipeObject, callback) => {
  dbMongo.saveRecipeMetadata(recipeObject.metadata, (err, result) => {
    if (err) {
      console.log('There was a problem saving recipe metadata in db.');
      callback(err);
      return;
    }

    dbMongo.saveRecipeDetails(recipeObject.details, (err, result) => {
      if (err) {
        console.log('There was a problem saving recipe details in db.');
        callback(err);
        return;
      }
      callback(null);
    });
  });
}

module.exports = getRecipesMetadata;