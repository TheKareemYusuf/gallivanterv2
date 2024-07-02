const mongoose = require("mongoose");
const CONFIG = require('./config/config')



// function to handle database connection
function connetToMongoDB() {
  mongoose.connect(CONFIG.DATABASE_URL);

  mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.log("Error connecting to MongoDB", err);
  });
}

module.exports = { connetToMongoDB };
