'use strict';

const request = require('request');

const getRecipeDetail = (dbMongo) => {

    return (req, res) => {

        let recipeId = req.params.identifier;
        console.log('Recipe ID: ' + recipeId);

        // check if the recipe is from BSH recipes or from external source
        let startIndex = 0;
        let endIndex = recipeId.indexOf('_');
        let idPrefix = recipeId.substring(startIndex, endIndex);

        console.log('Prefix to compare: ' + idPrefix);

        if (idPrefix === 'ext') {
            getExtRecipeDetail(dbMongo, recipeId, (err, recipeDetails) => {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                }

                if (!recipeDetails) {
                    res.status(404).end();
                } else {
                    console.log('Found recipe details for recipe ID: ' + recipeId);
                    res.send(recipeDetails);
                }
            });
        } else {
            // call BSH recipe service
            callBshRecipeService(recipeId, (err, recipe) => {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                }

                if (!recipe) {
                    res.status(404).end();
                } else {
                    console.log('Found recipe by recipe ID!');
                    res.send(recipe);
                }
            });
        }
    };
};

const callBshRecipeService = (recipeId, callback) => {
    var options = {
        method: 'GET',
        url: 'https://bshrecipes.mybluemix.net/recipesdetail/' + recipeId
    };

    request(options, (error, response, body) => {
        let statusCode = response.statusCode;

        if (error) {
            console.log(error);
            callback(error);
            return;
        }

        if (statusCode === 200) {
            let recipe;
            try {
                recipe = JSON.parse(body);
            } catch (e) {
                logger.error(e.message);
                return;
            }

            callback(null, recipe);
        }
    });
}

const getExtRecipeDetail = (dbMongo, recipeId, callback) => {
    dbMongo.getRecipeDetail(recipeId, (err, recipeDetails) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, recipeDetails);
    });
}

module.exports = getRecipeDetail;