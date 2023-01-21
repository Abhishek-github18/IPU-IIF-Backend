const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  image: {
    type: String
  },
//  
  title: { type: String },
  content: { type: String },
  date: { type: String },
});

module.exports = mongoose.model("event", eventSchema);
