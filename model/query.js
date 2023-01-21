const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
 
name: { type: String },
  email: { type: String },
  message:{type: String},
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("query", querySchema);