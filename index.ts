import express from "express";
import serverless from "serverless-http";

const app = express();

app.use('/', (req,res) => res.json({"hello": "world"}));


// catch-all route
app.use((req, res) => {
  console.error(`could not find path ${req.method} ${req.path}`);
  res.sendStatus(404);
});

// package the the express app
module.exports.app = serverless(app);
