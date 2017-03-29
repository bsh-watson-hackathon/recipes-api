'use strict';

const request = require('request');

const getRecipeMetadata = () => {

    return (req, res) => {

        let recipeId = req.params.identifier;
        console.log('Recipe ID: ' + recipeId);

        // check if the recipe is from BSH recipes or from external source
        let startIndex = 0;
        let endIndex = recipeId.indexOf('_');
        let idPrefix = recipeId.substring(startIndex, endIndex);

        console.log('Prefix to compare: ' + idPrefix);

        if (idPrefix === 'ext') {

            // TODO: call internal DB and get recipe already saved

        } else {
            // call BSH recipe service
            callBshRecipeService(recipeId, (err, recipeMeta) => {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                }

                if (!recipeMeta) {
                    res.status(404).end();
                } else {
                    console.log('Found recipe metadata by recipe ID!');
                    res.send(recipeMeta);
                }
            });
        }
    };
};

const callBshRecipeService = (recipeId, callback) => {
    var options = {
        method: 'GET',
        url: 'https://bshrecipes.mybluemix.net/recipesmetadata/' + recipeId
    };

    request(options, (error, response, body) => {
        let statusCode = response.statusCode;

        if (error) {
            console.log(error);
            callback(error);
            return;
        }

        if (statusCode === 200) {
            let recipeMeta;
            try {
                recipeMeta = JSON.parse(body);
            } catch (e) {
                logger.error(e.message);
                return;
            }

            callback(null, recipeMeta);
        }
    });
}

module.exports = getRecipeMetadata;