const express = require('express');
const multer = require('multer');
const sharp = require('sharp')
const User = require('../models/user');
const auth = require('../middleware/auth');
const {sendWelcomeEmail, sendGoodbyeEmail} = require('../emails/account');

const router = express.Router();

router.route('/users')
.post(async (req, res) => {
  const user = new User(req.body);

  try{
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken();
    res.status(201).send({user, token})
  } catch (e) {
    res.status(400).send(e)
  }
})

router.route('/users/login')
.post(async (req, res) => {
  try{
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({user, token});
  } catch(e) {
    res.status(400).send();
  }
})

router.route('/users/logout')
.post(auth, async (req, res) => {
  try{
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch(e){
    res.status(500).send();
  }
})

router.route('/users/logoutAll')
.post(auth, async (req, res) => {
  try{
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch(e){
    res.status(500).send();
  }
})

router.route('/users/me')
.get(auth, async (req, res) => {
  res.send(req.user);
})
.delete(auth, async (req, res) => {
  try{
    await req.user.remove();
    sendGoodbyeEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch(e){
    res.status(500).send()
  }
})
.patch(auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if(!isValidOperation){
    return res.status(400).send({"error": "Invalid updates!"})
  }

  try{
    updates.forEach((update) => req.user[update] = req.body[update])
    await req.user.save();
    res.send(req.user);
  } catch(e){
    res.status(400).send(e);
  }
})

const upload = multer({
  // dest: 'avatars',
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      cb(new Error('Please upload an image.'))
    }
    cb(undefined, true)
  }
})

router.route('/users/me/avatar')
.post(auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
})
.delete(auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send(req.user)
})

router.route('/users/:id/avatar')
.get(async(req, res) => {
  try{
    const user = await User.findById(req.params.id);
    if(!user || !user.avatar){
      throw new Error();
    }

    res.set('content-type', 'image/png')
    res.send(user.avatar)
  } catch(e){
    res.status(404).send();
  }
})

module.exports = router;
