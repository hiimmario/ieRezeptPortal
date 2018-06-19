var mongoose = require("mongoose");

// mongoose model config
var recipeSchema = new mongoose.Schema({
    title: String,
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String
    },
    created: {type: Date, default: Date.now},
    votes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "vote"
        }
    ]
});

module.exports = mongoose.model("recipe", recipeSchema);