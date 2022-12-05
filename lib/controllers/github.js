const { Router } = require('express');
const {
  exchangeCodeForToken,
  getGithubProfile,
} = require('../services/github');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');

module.exports = Router()
  .get('/login', async (req, res) => {
    // redirect to github login
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.GH_CLIENT_ID}&scope=user&redirect_uri=${process.env.GH_REDIRECT_URI}`
    );
  })

  .get('/callback', async (req, res) => {
    //get the code from the URL Search Params
    const { code } = req.query;
    //exchange the code for a token
    const token = await exchangeCodeForToken(code);
    //use the token to get info about the user from Github
    const user = await getGithubProfile(token);
    console.log(user);
    // const { email, login, avatar_url } = await getGithubProfile(token);
    //create a user with that info in our database
  });
