import redis from "redis";
import crypto from "crypto";
import axios from "axios";
import  session from "express-session";
import querystring from "querystring";
import _ from "underscore";

import { Application, RequestHandler } from "express";
import { access, readdirSync } from "fs";

// old school import for redis type session
const RedisStore = require("connect-redis")(session);


// default values for running in local dev. in prod these environment
// variables will be set to the right values
const REDIS_ENDPOINT:string = process.env.REDIS_ENDPOINT || '127.0.0.1:6379'
const REDIS_PASSWORD:string = process.env.REDIS_PASSWORD || '';
const SESSION_SECRET:string = process.env.SESSION_SECRET || '/r/savedyouaclick';


const COOKIE_AGE_SECONDS:number = 30 * 60; // thirty minutes

export default class Authenticator {
  private readonly _app:Application;
  private readonly _host:string;

  public constructor(app:Application) {
    this._app = app;
    const isProd:boolean = ("prod" == process.env.NODE_ENV);
    this._host = isProd ? "https://app.savedyouaclick.org" : "http://dev.savedyouaclick.org:3000";

    // need a connection to redis to hold sessions
    const redisClient = redis.createClient({
      host : REDIS_ENDPOINT.split(':')[0],
      port : REDIS_ENDPOINT.split(':')[1],
      password : REDIS_PASSWORD || undefined
    });
    redisClient.unref();
    redisClient.on('error', (e) => console.error(e));
    if (isProd) {
      this._app.enable("trust proxy");
    }

    // setup passport and sessions
    this._app.use(
      session({
        genid: _req => this.createHashString(12),
        
        // cookie name changes is dev.
        name: isProd ? "sess_" : "dev_",
        cookie: {
          maxAge: COOKIE_AGE_SECONDS * 1000, // convert to miliseconds
          domain: ".savedyouaclick.org",
          secure: isProd,
          sameSite: isProd ? "None" : "Lax"
        },
        proxy: isProd,
        resave: true,
        rolling: true,
        saveUninitialized: true,
        secret: SESSION_SECRET,
        store: new RedisStore({
          client : redisClient,
          prefix : isProd ? 'sess:' : 'dev:',

          // redis will keep the sessions around one minute longer
          // than the cookie expires, just in case
          ttl : COOKIE_AGE_SECONDS + 60
        })
      })
    );    

    this._app.get('/auth/login', this.redirectToRedditOauth);
    this._app.get('/auth/callback', this.redditAuthCallback);
  }

  public reddit =  (req, res, next) => {
    const reddit = req.session && req.session.reddit;
    const now = new Date().getTime();
    if (reddit && reddit.access_token && reddit.expires && reddit.expires > now) {
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
        req.session.reddit = reddit;
        res.redirect('/form');
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