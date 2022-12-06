const { Router } = require('express');
const Post = require('../models/Post.js');
//CI check
module.exports = Router()
  .post('/', async (req, res, next) => {
    const user = req.user.id;
    try {
      if (req.body.description.length > 255) {
        res.statusMessage = 'TOO LONG';
        res.status(400).end();
      } else {
        const post = await Post.insert({
          title: req.body.title,
          description: req.body.description,
          user_id: user,
        });
        res.json(post);
      }
    } catch (e) {
      next(e);
    }
  })

  .get('/', async (req, res, next) => {
    try {
      const post = await Post.getAll();
      res.json(post);
    } catch (e) {
      next(e);
    }
  });
