require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public/"));
app.set("view engine", 'ejs');
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate)

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secret",
userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
//---------------------Port Section---------------------
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("Server connected on " + PORT);
});

//---------------------Route Section---------------------
app.get("/", (req, res) => {
  res.render("home");
});

app.route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res)=>{
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    req.login(user, (err)=>{
      if(err){
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, ()=>{
          res.redirect("/secrets");
        });
      }
    });
  });

app.route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user)=>{
      if(err){
        console.log(err);
        res.redirect("/register");
      } else {
          passport.authenticate("local")(req, res, ()=>{
            res.redirect("/secrets");
          });
      }
    });
  });

app.get("/secrets", (req, res)=>{
  if(req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res)=>{
  req.logout();
  res.redirect("/");
});
