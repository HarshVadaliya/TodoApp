//jshint esversion:6

const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require('mongoose');
const _ = require("lodash");
const dotenv = require("dotenv");

//const date = require(__dirname + "/date.js");

const app = express();

//const Newitems = ["Study", "Play", "Read", "Ebook", "hll🅾"];
const workItems = [];

dotenv.config();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Breathe React"
});

const item2 = new Item({
    name: "Eat Code"
});

const item3 = new Item({
    name: "Sleep in C++"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.deleteOne({_id: "5f2ec9a0fa08ef38f41ed8ce"},function(err){
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Record deleted Successfully.");
//   }
// });


app.get("/",function(req, res){
  //const day  = date.getDate();
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("All Default items Successfully inserted in DB.");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListitems: foundItems});
    }
  });
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err) {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list.
        res.render("list", {listTitle: foundList.name, newListitems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
        console.log("Successfully deleted item");
        res.redirect("/");
      }
    });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err) {
          console.log("Successfully deleted item from custom LIST");
          res.redirect("/"+listName);
        } else {
          console.log(err);
        }
      });
    }
});

app.get("/about", function(req, res){
  res.render("about");
})

app.post("/work",function(req, res){
  const item = req.body.newItem;
  workItems.push(item);

  res.redirect("/work");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server has started Successfully.");
});
