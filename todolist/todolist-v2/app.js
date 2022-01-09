//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const path = require("path");

const app = express();
const publicDir = path.join(__dirname, 'public/')

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(publicDir))

mongoose.connect("mongodb+srv://jkligel:1618@cluster0-ax2hg.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list!"
});

const item2 = new Item({
  name: "Use the plus sign to add a new item"
});

const item3 = new Item({
  name: "Click the checkbox to delete"
});

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

  Item.find({}, (err, items) => {
    if (items.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) console.log(err);
        else console.log("Successfully added documents");
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }
  });

});

app.get("/:customList", function(req, res) {
  const customList = _.capitalize(req.params.customList);

  List.findOne({name: customList}, function(err, foundList){
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customList,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customList);
      } else {
        //show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndDelete(checkedItemId, function(err) {
      if (err) console.log(err);
      else {
        console.log("Successfully deleted " + checkedItemId);
        res.redirect("/");
      }
    });
  } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
  }
});

app.get("/about", function(req, res) {
  res.render("about");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server has started on ${port} successfully`);
});
