const mongoose = require("mongoose");
const dotenv = require("dotenv");
const  MONGO_URI  = "mongodb+srv://Abhishek-Admin:admincontrol123@cluster0.qgguxxv.mongodb.net/?retryWrites=true&w=majority";

dotenv.config();
exports.connect = () => {
  // Connecting to the database
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};
