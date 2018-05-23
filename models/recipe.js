var mongoose = require("mongoose");

// mongoose model config
var recipeSchema = new mongoose.Schema({
    title: String,
    text: String,
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("recipe", recipeSchema);