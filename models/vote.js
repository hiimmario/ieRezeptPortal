var mongoose = require("mongoose");

// mongoose model config
var voteSchema = new mongoose.Schema({
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "recipe"
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    like: Boolean,
    created: {
        type: Date, default: Date.now
    }
});

module.exports = mongoose.model("vote", voteSchema);