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
app.get("/editRecipe/:id", function(req, res) {

    recipeMongooseObject.findById(req.params.id).populate("votes").exec(function(err, foundRecipe) {
        if(err) console.log(err);
        else {
            //gibt eine liste an votes retour die gefiltert nach ich bin derjeniger der geliked hat, kann hier nur ein einziger sein da limitiert beim voten
            var myVote = foundRecipe.votes.filter(vote => vote.author == req.user.id);
            var countVotes = foundRecipe.votes.length;

            res.render("editRecipe", {foundRecipe: foundRecipe[0], iLike: (myVote.length > 0 ? true : false), countVotes: countVotes});
        }
    });
});

//show get route
app.get("/showRecipe/:id", function(req, res) {

    recipeMongooseObject.findById(req.params.id).populate("votes").exec(function(err, foundRecipe) {
        if(err) console.log(err);
        else {
            //gibt eine liste an votes retour die gefiltert werden, kann hier nur ein einziger sein da limitiert beim voten
            var myVote = foundRecipe.votes.filter(vote => vote.author == req.user.id);
            var countVotes = foundRecipe.votes.length;

            //(myVote.length > 0 ? true : false) wenn die länge der liste meiner vote(s) größer 0 ist habe ich das rezept geliked
            res.render("showRecipe", {recipe: foundRecipe, iLike: (myVote.length > 0 ? true : false), countVotes: countVotes});
        }
    });
});


//like route
app.post("/showRecipe/:id/like", function(req, res) {
    recipeMongooseObject.findById(req.params.id).populate("votes").exec(function(err, foundRecipe) {
        if (err) console.log(err);
        else {

            var myVote = foundRecipe.votes.filter(vote => vote.author == req.user.id);

            //habe ich dafür gevotet
            if(myVote.length == 0) {
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
                        foundRecipe.votes.push(newVote._id);
                        foundRecipe.save();
                    }
                });
            }
            res.redirect("/showRecipe/" + foundRecipe.id);
        }
    });
});

app.post("/showRecipe/:id/unlike", function(req, res) {
    recipeMongooseObject.findById(req.params.id).populate("votes").exec(function(err, foundRecipe) {
        if (err) console.log(err);
        else {
            // es kann nur einen vote geben - prüfung bei vote create
            myVoteList = foundRecipe.votes.filter(vote => vote.author == req.user.id);

            if(myVoteList.length > 0) {
                myVote = myVoteList[0];

                voteMongooseObject.findByIdAndRemove(myVote.id, function(req, todo) {
                    if(err) console.log(err);

                    foundRecipe.votes = foundRecipe.votes.filter(vote => vote.id != myVote.id);
                    foundRecipe.save();
                });
            }
            res.redirect("/showRecipe/" + foundRecipe.id);
        }
    });
});


//listrecipes get route
app.get("/listRecipes", function(req, res) {

    recipeMongooseObject.find({}).populate("votes").exec(function(err, recipes) {
        if(err) {
            console.log(err);
        } else {
            res.render("listRecipes", {recipes: recipes});
        }
    });
});

app.get("/contact", function(req, res) {
    res.render("contact");
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
            res.redirect("/showRecipe/" + newRecipe.id);
        }
    });
});

//port 3000; localhost:3000
app.listen(3000, function() {
    console.log("server started");
});