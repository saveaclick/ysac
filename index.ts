import express from "express";
import serverless from "serverless-http";
import serveStatic from "serve-static";
import nunjucks from "nunjucks";

import ApiRouter from "./routers/ApiRouter";
import ApplicationRouter from "./routers/ApplicationRouter";
import Authenticator from "./routers/Authenticator";
import path from "path";

const stage:string = process.env.NODE_ENV || 'prod';
const app = express();
app.use(
  "/assets",
  serveStatic(path.join(__dirname, "./assets"), { index: false })
);

nunjucks.configure('templates', { autoescape:true, express:app });

// AWS limitation -- there is no "root" endpoint
// this will work in localdev but not in productionf
app.get(`/test`, (req,res) => res.json({"hello": "world 2"}));

// Sessions are busted when deployed to stateless AWS lambda
// https://stackoverflow.com/questions/61255258/migrating-expressjs-app-to-serverless-express-session-problem

const auth = new Authenticator(app);
app.use(`/form`, new ApplicationRouter(/*auth*/).getRouter());
app.use(`/api`, new ApiRouter(auth).getRouter());


function errorNotification(err, str, req) {
  console.log('ERROR', err);
}
// catch-all route
app.use((req, res) => {
  const message:string = `could not find path ${req.method} ${req.path}`;
  console.error(message);
  res.json({
    "status" : 404,
    "message" : message
  });
});

app.use(function errorHandler(err, req, res, next) {
  console.error(err);
  res.json({
    "status" : 400,
    "message" : "some unknonwn error has occurred"
  });
});

// package the the express app
module.exports.app = serverless(app);
