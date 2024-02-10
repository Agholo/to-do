const mongoose = require("mongoose");
require("dotenv").config();

let connect = mongoose.connect(process.env.DATABASE_URI);

connect
  .then(() => {
    console.log("datebase is connected");
  })
  .catch(() => {
    console.log("database is not connected");
  });

const loginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  tasks: {
    type: [
      {
        title: {
          type: String,
          required: false,
        },
        description: {
          type: String,
          required: false,
        },
      },
    ],
    required: false,
  },
});

let collectPart = new mongoose.model("users", loginSchema);

module.exports = collectPart;
