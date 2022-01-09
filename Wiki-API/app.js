const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set("view engine", ejs);
app.use(express.static("public/"));

mongoose.connect("mongodb+srv://jkligel:1618@cluster0-ax2hg.mongodb.net/wikiDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const articleSchema = {
  title: String,
  content: String
};
const Article = mongoose.model("Article", articleSchema);

// -------------------Port Section-------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log("Server connected on " + PORT);
});

// -------------------All articles Section-------------------
app.route("/articles")
  .get((req, res) => {
    Article.find((err, foundArticles) => {
      if (!err) res.send(foundArticles);
      else res.send(err);
    });
  })
  .post((req, res) => {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });
    newArticle.save((err) => {
      if (!err) res.send("Successfully added new article.");
      else res.send(err);
    });
  })
  .delete((req, res) => {
    Article.deleteMany((err) => {
      if (!err) res.send("Successfully deleted all articles");
      else res.send(err);
    });
  });

// -------------------Single article Section-------------------

app.route("/articles/:articleTitle")
  .get((req, res) => {
    Article.findOne({
      title: req.params.articleTitle
    }, (err, foundArticle) => {
      if (foundArticle) res.send(foundArticle);
      else res.send("No articles matching that title was found");
    });
  })
  .put((req, res) => {
    Article.updateOne({
        title: req.params.articleTitle
      }, {
        title: req.body.title,
        content: req.body.content
      },
      (err) => {
        if (!err) res.send("Successfully updated article");
        else res.send(err);
      });
  })
  .patch((req, res) => {
    Article.updateOne({
        title: req.params.articleTitle
      }, {
        $set: req.body
      },
      (err) => {
        if (!err) res.send("Successfully updated article");
        else res.send(err);
      });
  })
  .delete((req, res) => {
    Article.deleteOne({
      title: req.params.articleTitle
    }, (err)=>{
      if(!err) res.send('Successfully deleted article');
      else res.send(err);
    });
  });
