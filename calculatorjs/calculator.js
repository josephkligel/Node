const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", function(req, res) {
  var result = Number(req.body.x) + Number(req.body.y);
  res.send("The result of the calculation is " + result);
});

app.get("/bmicalculator", function(req, res) {
  res.sendFile(__dirname + "/bmiCalculator.html");
});

app.post("/bmicalculator", function(req, res) {
  var wt = Number(req.body.weight);
  var ht = Number(req.body.height);
  var BMI = wt/Math.pow(ht, 2);
  res.send("Your BMI is " + roundToTwo(BMI));
});

app.listen(3000, function() {
  console.log("Server is running on port 3000");
});

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}
