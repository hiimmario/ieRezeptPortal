var express                     = require("express");
var app = express();

var bodyParser                  = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
app.set("view engine", "ejs");

var mongoose                    = require("mongoose");
mongoose.connect("mongodb://localhost/ieRecipePortal");

var recipeMongooseObject = require("./models/recipe");

//entry point - redirect to whatever needed
app.get("/", function(req, res) {
    res.redirect("listRecipes");
});



//show get route
app.get("/showRecipe/:id", function(req, res) {

    recipeMongooseObject.findById(req.params.id, function(err, foundRecipe) {
        if(err) console.log(err);
        else {
            res.render("showRecipe", {recipe: foundRecipe});
        }
    });
});


//listrecipes get route
app.get("/listRecipes", function(req, res) {
    recipeMongooseObject.find({}, function(err, recipes) {
        if(err) {
            console.log(err);
        } else {
            res.render("listRecipes", {recipes: recipes});
        }
    });
});


//create routes
//create recipe get route
app.get("/createRecipe", function(req, res) {
    res.render("createRecipe");
});

//create recipe post route
app.post("/createRecipe", function(req, res) {

    var title = req.body.recipe.title;
    var text = req.body.recipe.text;

    var newRecipe = {title: title, text: text};

    recipeMongooseObject.create(newRecipe, function(err, newRecipe) {
        if(err) {
            console.log(err);
        } else {
            console.log(newRecipe);
            res.render("showRecipe", {recipe: newRecipe});
        }
    });
});



//port 3000; localhost:3000
app.listen(3000, function() {
    console.log("server started");
});