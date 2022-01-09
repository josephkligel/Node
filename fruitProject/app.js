const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/fruitsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const fruitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please check your data entry. No name specified."]
  },
  rating: {
    type: Number,
    min: 1,
    max: 10
  },
  review: String
});

const Fruit = mongoose.model("Fruit", fruitSchema);

const fruit = new Fruit({
  rating: 7,
  review: "Apples are tasty, especially the green ones"
});

// fruit.save();

const personSchema = new mongoose.Schema({
  name: String,
  age: Number,
  favoriteFruit: fruitSchema
});

const Person = new mongoose.model("Person", personSchema);

const dragonFruit = new Fruit({
  name: "Dragon Fruit",
  rating: 9,
  review: "Wonderfully juicy!"
});

// dragonFruit.save();

const person = new Person({
  name: "Joseph",
  age: 29,
  favoriteFruit: dragonFruit
});

// person.save();

//
// Fruit.insertMany([kiwi, orange, banana], function(err) {
//   if (err) console.log(err);
//   else {
//     console.log("Successfully saved all the fruits to fruitsDB");
//   }
// });

Fruit.find(function(err, fruits) {
  if (err) console.log(err);
  else {
    mongoose.connection.close();
    fruits.forEach(function(fruit) {
      console.log(fruit.name + "\t" + fruit.rating + "/10" + "\t" + fruit.review);
    });
  }
});

// Fruit.updateOne({_id: "5e62839bdfc8ff140727aceb"}, {name: "Peach"}, function(err) {
//   if (err) console.log(err);
//   else {
//     console.log("Successfully updated the document");
//   }
// })

// Fruit.deleteOne({name: "Peach"}, function(err) {
//   if (err) console.log(err);
//   else console.log("Deletion was successful");
// });

// Person.deleteMany({name: "Joseph"}, function(err) {
//   if (err) console.log(err);
//   else console.log("Successfully deleted records from the 'people' collection");
// });

// Person.updateOne({
//     name: "Joseph"
//   }, {
//     favoriteFruit: dragonFruit
//   },
//   function(err) {
//     if (err) console.log(err);
//     else console.log("The people's record was successfully updated");
//   });
