'use strict';

const request = require('request'),
    async = require('async');

const recipeMacher = (recipes, user, mainCallback) => {

    let recipesMetadata;
    async.each(recipes, (recipe, callback) => {

        filterRecipeByDislikes(recipe.details, user, (err, filterRecipe) => {
            if (!filterRecipe) {
                recipesMetadata.push(recipe.metadata);
            }
            callback();
        });
    }, (err) => {
        if (err) {
            console.log('There was a problem matching recipes: ' + err);
            mainCallback(err)
        } else {
            console.log('Successfully matched recipes. Returning array of recipes metadata.');
            mainCallback(recipesMetadata);
        }
    });
}

const filterRecipeByDislikes = (recipeDetails, user, callback) => {

    let filterRecipe = false;
    let dislikes = user.ingredient_dislike;

    mergeIngredientsLists(recipeDetails, (err, ingredientsList) => {
        console.log(ingredientsList);

        async.each(ingredientsList, (ingredient, callback) => {
            for (let i = 0; i < dislikes.length; i++) {
                if (ingredient.includes(dislikes[i])) {
                    filterRecipe = true;
                }
            }
        }, (err) => {
            if (err) {
                console.log('There was a problem comparing ingredients: ' + err);
                callback(err)
            } else {
                callback(null, filterRecipe);
            }
        });
    });
}

const mergeIngredientsLists = (recipeDetails, mainCallback) => {
    let ingredientsList;

    async.each(recipeDetails.ingredients_lists, (list, callback) => {
        for (let i = 0; i < list.length; i++) {
            ingredientsList.push(list[i]); 
        }
        callback();
    }, (err) => {
        if (err) {
            console.log('Problem merging ingredients lists: ' + err);
            mainCallback(err)
        } else {
            console.log('Successfully merged ingredients lists.');
            mainCallback(ingredientsList);
        }
    });
}

module.exports = recipeMacher;