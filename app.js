var express                     = require("express");
var app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

//entry point - redirect to whatever needed
app.get("/", function(req, res) {
    res.redirect("/createReceipt");
});


//create receipt page
app.get("/createReceipt", function(req, res) {
    res.render("createReceipt");
});




//port 3000; localhost:3000
app.listen(3000, function() {
    console.log("server started");
});