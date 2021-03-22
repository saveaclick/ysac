"use strict";

import express from "express";
import serverless from "serverless-http";


const app = express()

app.get('/helloworld', function (req, res) {
  res.send('Hello World! 5')
})

module.exports.handler = serverless(app);