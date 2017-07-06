const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const bodyParser = require('body-parser');
const parseurl = require('parseurl');

app.use('/static', express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/static/index.html");
})
mongoose.connect('mongodb://localhost:27017/todos');

const todoSchema = new mongoose.Schema ({
  title: {type: String, required: true, unique: true},
  order: {type: Number, required: true, unique: true},
  completed: {type: Boolean, required: true, default: false}
})

todoSchema.methods.toJSON = function() {
  return {
    id: this._id,
    completed: this.completed,
    order: this.order,
    title: this.title
  }
}

const Todos = mongoose.model('Todos', todoSchema);

app.get('/api/todos/', function(req, res) {
    Todos.find({}).then(function (todos) {
      res.json(todos);
    })
})

app.post('/api/todos/', function(req, res) {
  var todos = new Todos({
    title: req.body.title,
    order: req.body.order,
    completed: req.body.completed});
    todos.save(todos)
      .then(function (todos) {
        res.status(201).json(todos.toJSON());
    })
});

const getTodo = function (req, res, next) {
  var id = req.params.id;
  Todos.findById(id)
    .then(function(todo){
      req.todo = todo;
      next();
  })
}

app.get('/api/todos/:id', getTodo, function(req, res) {
    res.json(req.todo.toJSON());
});

app.put('/api/todos/:id', getTodo, function(req, res) {
    const todo = req.todo;
    todo.title = req.body.title;
    todo.completed = req.body.completed;
    todo.order = req.body.order;
    todo.save()
    .then (function () {
      res.json(todo.toJSON());
    })
});

app.delete('/api/todos/:id', getTodo, function(req, res) {
  todo.deleteOne()
  .then (function () {
    res.json(todo.toJSON());
  })
});

app.listen(3000, function () {
    console.log('Express running on http://localhost:3000/.')
});

module.exports = Todos;
