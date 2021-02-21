import { Application, RequestHandler } from "express";

export default class Authenticator {

  public constructor(app:Application) {
    // TODO implement authentication via OAuth
  }

  public reddit:RequestHandler = (req, res, next) => {
    // TODO: ensure that the visitor is authenticated
    // with reddit
    next();
  }
}