import redis from "redis";
import crypto from "crypto";
import passport from "passport";
import  session from "express-session";

import { Application, RequestHandler } from "express";

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

  public constructor(app:Application) {
    this._app = app;
    const isProd:boolean = ("prod" == process.env.NODE_ENV);

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
        name: isProd ? "sess_" : "dev_",
        cookie: {
          maxAge: COOKIE_AGE_SECONDS * 1000, // convert to miliseconds
          domain: isProd ? ".savedyouaclick.org" : "dev.savedyouaclick.org",
          secure: isProd,
          sameSite: isProd ? "none" : "strict"
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
    this._app.use(passport.initialize());
    this._app.use(passport.session());
  }

  public reddit:RequestHandler = (req, res, next) => {
    // TODO: ensure that the visitor is authenticated
    // with reddit
    next();
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