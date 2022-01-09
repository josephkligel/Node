require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

const port = process.env.port || 3000;
app.listen(port, function() {
  console.log("Server started on port 3000");
});

app.route("/")
.get(function(req, res) {
  res.sendFile(__dirname + "/index.html");
})
.post(function(req, res) {
  var crypto = req.body.crypto;
  var fiat = req.body.fiat;
  var amount = req.body.amount;

  var options = {
    url: "https://apiv2.bitcoinaverage.com/convert/global",
    headers: {
      'x-ba-key': process.env.key
    },
    method: "GET",
    qs: {
      from: crypto,
      to: fiat,
      amount: amount
    }
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    var currentDate = data.time;
    var price = data.price;

    res.write("<p>The current date is " + currentDate + "</p>");
    res.write("<h1>" + amount + crypto + " is currently worth " + price + fiat + "</h1>");

    res.send();
  });

});
