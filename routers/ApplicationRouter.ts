import { RequestHandler } from "express";
import AbstractRouter from "./AbstractRouter";
import Authenticator from "./Authenticator";

export default class ApplicationRouter extends AbstractRouter {
  public constructor(auth:Authenticator) {
    super(auth);

    // all routes must be authenticated with reddit
    this._router.use(auth.reddit);
    this._router.get('/', this.handleApp);
  }

  private handleApp = (req, res) => {
    const reddit = req.session.reddit;
    res.render('form.njk', { reddit: JSON.stringify(reddit,null,2) });
  }
}