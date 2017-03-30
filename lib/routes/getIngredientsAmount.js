'use strict';

const request = require('request');

const getIngredientsAmount = (database) => {

  return (req, res) => {
    let recipeId = req.params.identifier;
    // check if the recipe is from BSH recipes or from external source
    let startIndex = 0;
    let endIndex = recipeId.indexOf('_');
    let idPrefix = recipeId.substring(startIndex, endIndex);

    console.log('Prefix to compare: ' + idPrefix);

    if (idPrefix === 'ext') {

      database.getIngredientsAmount(req.params.identifier, req.query.amountOfIngredient, (err, amount) => {
        if (err) {
          return res.status(500).end();
        }
        res.send(amount);
      });
    } else {
      var options = {
        method: 'GET',
        url: 'https://bshrecipes.mybluemix.net/recipesdetail/' + recipeId + '/ingredients_list?amountOfIngredient=' + req.query.amountOfIngredient
      };

      request(options, (error, response, body) => {
        let statusCode = response.statusCode;

        if (error) {
          console.log(error);
          return res.status(500).end();
        }

        if (statusCode === 200) {
          let ingrediendtData;
          try {
            ingrediendtData = JSON.parse(body);
            res.send(ingrediendtData)
          } catch (e) {
            logger.error(e.message);
            return;
          }
        }
      });
    }
  }
}

module.exports = getIngredientsAmount;
