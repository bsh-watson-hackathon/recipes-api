'use strict';

const request = require('request'),
    async = require('async'),
    _ = require('lodash');

const recipeMacher = (recipes, user, mainCallback) => {

    let recipesMetadata = [];
    async.each(recipes, (recipe, callback) => {

        filterRecipeByDislikes(recipe.details, user, (err, filterRecipe) => {
            if (filterRecipe) {
                recipesMetadata.push(recipe.metadata);
            } else {
                console.log('Filtered recipe with ID: ' + recipe.metadata.identifier);
            }
            callback();
        });
    }, (err) => {
        if (err) {
            console.log('There was a problem matching recipes: ' + err);
            mainCallback(err)
        } else {
            console.log('Successfully matched recipes. Returning array of recipes metadata.');
            mainCallback(null, recipesMetadata);
        }
    });
}

const filterRecipeByDislikes = (recipeDetails, user, callback) => {

    let filterRecipe = true;
    let dislikes = user.ingredient_dislike;

    mergeIngredientsLists(recipeDetails, (err, ingredientsList) => {
        async.each(ingredientsList, (ingredient, midCallback) => {

            async.each(dislikes, (dislike, innerCallback) => {
                ingredient = ingredient.toLowerCase();
                dislike = dislike.toLowerCase();
                let contains = _.includes(ingredient, dislike);
                if (contains) {
                    filterRecipe = false;
                }
                innerCallback()
            }, (err) => {
                if (err) {
                    midCallback(err)
                } else {
                    midCallback(null, filterRecipe);
                }
            });
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
    let ingredientsList = [];

    console.log('Recipe details: ' + recipeDetails);
    console.log('Ingredients lists: ' + recipeDetails.ingredients_lists);

    async.each(recipeDetails.ingredients_lists, (list, callback) => {
        async.each(list.ingredients, (item, innerCallback) => {
            ingredientsList.push(item);
            innerCallback()
        }, (err) => {
            if (err) {
                callback(err)
            } else {
                callback();
            }
        });
    }, (err) => {
        if (err) {
            console.log('Problem merging ingredients lists: ' + err);
            mainCallback(err)
        } else {
            console.log('Successfully merged ingredients lists.');
            mainCallback(null, ingredientsList);
        }
    });
}

module.exports = recipeMacher;