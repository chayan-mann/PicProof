const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send({ success: true, message: "server up!" });
});

//DATABASE CONNECTION
mongoose
  .connect(`${process.env.MONGO_URL}`)
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `App listening on port http://localhost:${process.env.PORT}/ -> db connected.`
      );
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed!!!", err);
});