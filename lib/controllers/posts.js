const { Router } = require('express');
const Post = require('../models/Post.js');

module.exports = Router().post('/', async (req, res, next) => {
  try {
    const post = await Post.insert({
      title: req.body.title,
      description: req.body.description,
    });
    res.json(post);
  } catch (e) {
    next(e);
  }
});
