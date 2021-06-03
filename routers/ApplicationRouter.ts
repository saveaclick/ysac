import { RequestHandler } from "express";
import { url } from "node:inspector";
import AbstractRouter from "./AbstractRouter";
import Authenticator from "./Authenticator";

export default class ApplicationRouter extends AbstractRouter {
  public constructor(auth?:Authenticator) {
    super(auth);

    // all routes must be authenticated with reddit
    if (auth) {
      this._router.use(auth.reddit);
    }
    this._router.get('/', this.handleApp);
  }

  private handleApp = (req, res) => {
    const models = {
      "token" : req.query.token
    }
    res.render('form.html', models);
  }
}