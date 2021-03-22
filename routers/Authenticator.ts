import redis from "redis";
import crypto from "crypto";
import axios from "axios";
import querystring from "querystring";
import _ from "underscore";

import { Application, RequestHandler } from "express";
export default class Authenticator {
  private readonly _app:Application;
  private readonly _host:string;

  public constructor(app:Application) {
    this._app = app;
    this._host = process.env.ROOT_HOST || 'https://app.savedyouaclick.org';

    if ("prod" == process.env.NODE_ENV) {
      this._app.enable("trust proxy");
    }

    this._app.get('/auth/login', this.redirectToRedditOauth);
    this._app.get('/auth/callback', this.redditAuthCallback);
  }

  public reddit =  (req, res, next) => {
    const token = req.query && req.query.token;
    const now = new Date().getTime();
    if (token) {
      // todo: make sure the token is legit more explicitly
      next();
    } else {
      res.sendStatus(401);
    }
  }

  private redirectToRedditOauth:RequestHandler = (req, res) => {
    const baseAuthUrl = "https://www.reddit.com/api/v1/authorize";
    const params = {
      client_id : process.env.REDDIT_CLIENT_ID,
      response_type : "code",
      state : this.createHashString(8),
      redirect_uri : this._host + '/auth/callback',
      scope: "identity submit"
    };
    res.redirect(`${baseAuthUrl}?${querystring.stringify(params)}`);
  }

  private redditAuthCallback = async (req, res) => {
    const accessTokenUrl = "https://www.reddit.com/api/v1/access_token";
    const formData = {
      grant_type : "authorization_code",
      redirect_uri : this._host + '/auth/callback',
      code : req.query.code as string
    };
    const auth = {
      username : process.env.REDDIT_CLIENT_ID as string,
      password : process.env.REDDIT_CLIENT_SECRET as string
    };
    const headers = {
      "Content-Type" : "application/x-www-form-urlencoded"
    };
    try {
      const result = await axios.post(accessTokenUrl, querystring.stringify(formData), { auth, headers });
      if (result && result.data && !result.data.error) {
        console.log(result.data);
        const reddit = _.omit(result.data, 'expires_in');
        reddit.expires = result.data.expires_in + (new Date().getTime());
        res.redirect(`/form?token=${reddit.access_token}`);
      } else {
        res.status(500).json(result.data);
      }
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }

  private createHashString = (howMany: number): string => {
    // standard alpha-numeric if no chars provided
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const rnd = crypto.randomBytes(howMany),
      value = new Array(howMany),
      len = chars.length;

    for (let i = 0; i < howMany; i++) {
      value[i] = chars[rnd[i] % len];
    }
    return value.join("");
  };
}