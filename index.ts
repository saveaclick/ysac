import express from "express";
import serverless from "serverless-http";
import nunjucks from "nunjucks";

import ApiRouter from "./routers/ApiRouter";
import ApplicationRouter from "./routers/ApplicationRouter";
import Authenticator from "./routers/Authenticator";


const app = express();
const auth = new Authenticator(app);
nunjucks.configure('templates', { autoescape:true, express:app });

// AWS limitation -- there is no "root" endpoint
// this will work in localdev but not in productionf
app.get('/', (req,res) => res.json({"hello": "world"}));

app.use('/form', new ApplicationRouter(auth).getRouter());
app.use('/api', new ApiRouter(auth).getRouter());

function errorNotification(err, str, req) {
  console.log('ERROR', err);
}
// catch-all route
app.use((req, res) => {
  console.error(`could not find path ${req.method} ${req.path}`);
  res.sendStatus(404);
});

app.use(function errorHandler(err, req, res, next) {
  console.error(err);
  res.sendStatus(500);
});

// package the the express app
module.exports.app = serverless(app);
