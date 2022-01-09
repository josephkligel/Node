const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/views/date.js");

const app = express();
let tasks = ["Buy Food", "Cook Food", "Eat Food"];
let workTasks = [];
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.listen(port, function() {
  console.log("Server is connected on port 3000");
});

app.get("/", function(req, res) {

  res.render("list", {
    listTitle: date.getDate(),
    newListTasks: tasks
  });
});

app.post("/", function(req, res) {
  let task = req.body.newTask;

  if (req.body.list === "Work") {
    workTasks.push(task);
    res.redirect("/work");
  } else {
    tasks.push(task);
    res.redirect("/");
  }
});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListTasks: workTasks
  });
});

app.post("/work", function(req, res) {
  let task = req.body.newTask;
  workTasks.push(task);

  res.redirect("/work");
});

app.get("/about", function(req, res) {
  res.render("about");
})
