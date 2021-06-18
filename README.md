# You Saved a Click

The purpose of this project is to make it easier to post content to /r/savedyouaclick. 

## Dependencies
You will need to have installed [Node.js](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/), the Package Manager for Node.js Modules. You can check if you have these installed by running 
```bash
    node -v
    npm -v
```
This project also uses [Visual Studio Code](https://code.visualstudio.com/) which has support for the JavaScript and TypeScript languages, as well as Node.js debugging.

## How to set up and run locally
For the next step in setting up this project, you will need to sign into reddit and create a [Reddit OAuth App](https://www.reddit.com/prefs/apps) which will give you a Client ID and Client Secret which you will use in your launch.json file. When you create the new app, you may set the name and description to whatever you want it to be but you must set the "about url" as https://savedyouaclick.org/about.html and the redirect uri as http://dev.savedyouaclick.org:3000/auth/callback. Then just click "create app" and underneath the app name, there will be a code. This code is your REDDIT_CLIENT_ID and the secret is your REDDIT_CLIENT_SECRET.

### .vscode/launch.json
In the .vscode directory, you will place a launch.json file with the same contents as the launch.json.example file, except you will add a few extra environment variables. You will need to add 

```
    "REDDIT_CLIENT_ID" : "your_client_id",
    "REDDIT_CLIENT_SECRET" : "your_client_secret",
    "ROOT_HOST" : "http://dev.savedyouaclick.org:3000",
    "SUBREDDIT_NAME" : "your_subreddit_name"
```
The purpose of adding a variable for a subreddit name is so that you can create your own subreddit and you may do test posts without having "clutter" on the actual /r/savedyouaclick.

### Running the project
Now that everything is installed, and you have all your secrets, you may now run the project. Navigate to dev.savedyouaclick.org:3000/auth/login and you should be redirected to the reddit OAuth app that you created, which is asking for permissions. Click allow and you should then be taken to the savedyouaclick submission form. Type in a spoiler, paste the article url and click the submit button and that post should then be posted to the subreddit that you specified in the SUBREDDIT_NAME in your environment variables in the launch.json file.


