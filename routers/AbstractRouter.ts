import express, { Router } from "express";
import Authenticator from "./Authenticator";

export default abstract class AbstractRouter {

  protected readonly _router:Router;
  protected readonly _auth:Authenticator;
  
  protected constructor(auth?:Authenticator) {
    this._router = express.Router();
    if (auth) {
      this._auth = auth;
    }
  }


  public getRouter():Router {
    return this._router;
  }
}