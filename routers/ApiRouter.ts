import { RequestHandler } from "express";
import snoowrap from "snoowrap";
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
    
    //Get headline from URL
    function getHeadlineAndArchiveUrl(url: string) {
      //This uses a cloudflare worker running https://github.com/Darkseal/CORSflare. Exact implemenation can be found in cloudflare.js
      const UrlObj = new URL(url);
      return Promise.all([fetch(
          `https://little-dream-43b9.roshkins-cloudflare.workers.dev${UrlObj.pathname}?url_for_headline=${encodeURIComponent(UrlObj.hostname)}`, {mode: "cors"}
      ).then(res => res.ok ? res.text() : null).then(body => {
          let el = document.createElement("html");
          el.innerHTML = body || "";
          let headline = el.querySelector("meta[property='og:title']")?.getAttribute('content') || el.querySelector('h1')?.innerText;
          if (!headline)
            throw "Headline not found";
          return (headline);
      }),
      // fetch the saaved archive.org URL after following all redirects. 
      // This can be more robust in production, with fallback to archive.is or querying for the archive.org url
      fetch(`https://little-dream-43b9.roshkins-cloudflare.workers.dev/api/?url=${encodeURIComponent(url)}&url_for_headline=robustlinks.mementoweb.org`).then((resp: Response) => {
          return resp.ok ? resp.json() : 'failed';
      }).then(json => json['data-versionurl'])]);
    }

    function postAsUser(headline: string, spoiler: string, archivedUrl: string, clientId: string, clientSecret: string, accessToken: string) {
      // Use https://not-an-aardvark.github.io/reddit-oauth-helper/ for refreshToken and accessToken, make sure to have submit permissions
      const r = new snoowrap({
          userAgent: "SYAC proof of concept DEV Build 0.1",
          clientId: clientId,
          clientSecret: clientSecret,
          accessToken: accessToken
      });
      r.submitLink({
          subredditName: "ysac_dev",
          title: `${headline} | ${spoiler}`,
          url: archivedUrl
      }).then(()=>{alert('Posted!')});
    }

    const auth = {
      username : process.env.REDDIT_CLIENT_ID as string,
      password : process.env.REDDIT_CLIENT_SECRET as string
    };

    getHeadlineAndArchiveUrl(req.query.url as string).then(([headline, archiveUrl]) => postAsUser(headline || "Headline not detected", req.query.spoiler as string, archiveUrl, auth.username, auth.password, req.query.token as string));

    res.json({"test":true});
  }
}