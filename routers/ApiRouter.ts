import { RequestHandler } from "express";
import AbstractRouter from "./AbstractRouter";
import Authenticator from "./Authenticator";

export default class ApiRouter extends AbstractRouter {

  public constructor(auth?:Authenticator) {
    super(auth);
    if (auth) {
      this._router.use(auth.reddit);
    }
    this._router.post('/submit', this.postSubmission);
  }

  // TODO: implement the endpoint that posts clickbait
  public postSubmission:RequestHandler = (req, res) => {
    res.json({"test":true});
  }
}