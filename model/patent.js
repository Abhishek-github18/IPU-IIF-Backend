const mongoose = require("mongoose");

const patentSchema = new mongoose.Schema({

  patentGrantDate: { type: String },
  patentNo: {type: String},
  patentee: {type: String},
  certificate: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("patent", patentSchema);