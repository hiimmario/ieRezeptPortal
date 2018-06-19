var recipeMongooseObject = require("./models/recipe");

var middlewareObject = {};

middlewareObject.isLoggedIn = function(req, res, next) {
    console.log(req);
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

middlewareObject.checkRecipeOwnership = function (req, res, next) {
    if(req.isAuthenticated()) {
        console.log(req.params.id);
        recipeMongooseObject.findById(req.params.id, function(err, foundRecipe) {
            if(err) {
                console.log(err);
            }
            else {
                if(foundRecipe.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    res.redirect("back");
                }
            }
        });
    }
    else {
        res.redirect("back");
    }
};

module.exports = middlewareObject;