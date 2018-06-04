var express                     = require("express");
var app = express();

var bodyParser                  = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
app.set("view engine", "ejs");

var mongoose                    = require("mongoose");
mongoose.connect("mongodb://localhost/ieRecipePortal");
var recipeMongooseObject = require("./models/recipe");

var voteMongooseObject = require("./models/vote");

// user and passport configuration
var passport                = require("passport");
var localStrategy           = require("passport-local");
var user                    = require("./models/user");

//passport configuration
app.use(require("express-session")({
    secret: "ieprojekt2018",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

//entry point - redirect to whatever needed
app.get("/", function(req, res) {
    res.redirect("listRecipes");
});

//auth-routes
app.get("/register", function(req, res) {
    res.render("register");
});

//handling registers
app.post("/register", function(req, res) {
    var newUser = new user({username: req.body.username});
    var password = req.body.password;

    user.register(newUser, password, function(err, user) {
        if(err){
            console.log(err);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function() {
            console.log(user);
            res.redirect("/listRecipes");
        });
    });
});

//login route
app.get("/login", function(req,res) {
    res.render("login");
});

//handling logins
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/listRecipes",
        failureRedirect: "/register"
    }), function(req, res){

});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/listRecipes");
});

//crowd favourites TODO
app.get("/favourites", function(req, res) {
    res.redirect("listRecipes");
});

//show get route
app.get("/showRecipe/:id", function(req, res) {

    recipeMongooseObject.findById(req.params.id).populate("votes").exec(function(err, foundRecipe) {
        if(err) console.log(err);
        else {
            console.log("############");

            console.log(foundRecipe.votes);
            res.render("showRecipe", {recipe: foundRecipe});
        }
    });
});


//like route
app.post("/showRecipe/:id/like", function(req, res) {
    recipeMongooseObject.findById(req.params.id, function (err, foundRecipe) {
        if (err) console.log(err);
        else {
            console.log(foundRecipe);

            var like = true;
            var author = req.user.id;

            var recipe = foundRecipe.id;

            var vote = {
                author: author,
                recipe: recipe,
                like: like
            };

            voteMongooseObject.create(vote, function (err, newVote) {
                if (err) console.log(err);
                else {
                    console.log(newVote);
                    res.render("showRecipe", {recipe: foundRecipe});
                }
            });
        }
    });
});

//unlike route
app.post("/showRecipe/:id/unlike", function(req, res) {
    recipeMongooseObject.findById(req.params.id, function (err, foundRecipe) {
        if (err) console.log(err);
        else {
            console.log(foundRecipe);

            var like = false;
            var author = req.user.id;

            var recipe = foundRecipe.id;

            var vote = {
                author: author,
                recipe: recipe,
                like: like
            };

            voteMongooseObject.create(vote, function (err, newVote) {
                if (err) console.log(err);
                else {
                    console.log(newVote);
                    res.render("showRecipe", {recipe: foundRecipe});
                }
            });
        }
    });
});


//listrecipes get route
app.get("/listRecipes", function(req, res) {

    console.log(req.user);

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
    var author = {
        id: req.user._id,
        username: req.user.username
    };

    var newRecipe = {title: title, text: text, author: author};

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