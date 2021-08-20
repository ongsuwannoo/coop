const express = require("express");
const app = express();

app.get("/health", (req, res) => {
  res.send("respond with a resource");
});
module.exports = app;