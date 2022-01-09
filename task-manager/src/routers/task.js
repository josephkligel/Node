const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth')
const router = express.Router();

router.route('/tasks')
.get(auth, async (req, res) => {
  const match = {}
  const sort = {}

  if(req.query.completed) match.completed = req.query.completed === 'true';
  if(req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 
  }

  try{
    await req.user.populate({
      path: 'tasks',
      match, //Get /tasks?completed=true
      options: {
        limit: parseInt(req.query.limit),//Get /tasks?limit=30
        skip: parseInt(req.query.skip), //Get/tasks?skip=3
        sort //Get /tasks?sortBy=createdAt_desc. 1 is ascending and -1 is descending
      }
    }).execPopulate();
    res.send(req.user.tasks)
  } catch(e) {
    res.status(500).send(e)
  }
})
.post(auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })
  try{
    await task.save()
    res.status(201).send(task)
  } catch(e) {
    res.status(404).send(e)
  }
})

router.route('/tasks/:id')
.get(auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOne({_id, owner: req.user._id})
    if(!task) res.status(404).send('Does not exist');
    res.send(task);
  } catch(e) {
    res.status(404).send(e)
  }
})
.patch(auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"]
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))

  if(!isValidOperation) return res.status(400).send({ "Error": "Invalid updates!"});

  try{
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
    // const task = await Task.findById(req.params.id);

    if(!task) res.status(404).send('Does not Exist')
    updates.forEach((update) => task[update] = req.body[update]);
    await task.save();

    res.send(task)
  } catch(e){
    res.status(400).send(e)
  }
})
.delete(auth, async (req, res) => {
  try{
    const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
    if(!task) res.status(404).send()
    res.send(task)
  } catch(e) {
    res.status(500).send()
  }
})

module.exports = router;
