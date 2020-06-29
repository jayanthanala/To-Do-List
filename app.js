//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("local mongodb url",{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);


const item1 = new Item({
  name: "Welcome to ToDo List App"
});
const item2 = new Item({
  name: "Click + to add new items"
});

const item3 = new Item({
  name: "<--- Hit that to delete items"
});

const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);


// Gets

app.get("/", function(req, res) {

  Item.find({}, function(err, results) {
    if (results.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        }
        res.redirect("/");
      });
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: results,
        active1: "active",
        active2:"act",
        active3:"act"
      });
    }
  })
});

app.get("/:random", function(req, res) {
  const random = _.capitalize(req.params.random);

  List.findOne({name:random},function(err,results){
    if(!err){
      if(!results){
        const list = new List({
          name: random,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+random);
      }else{
        if(random==="Books"){
        res.render("list",{listTitle:random,newListItems:results.items,active1:"act",active3: "active",active2:"act"});
      }else{
        res.render("list",{listTitle:random,newListItems:results.items,active1:"act",active3: "act",active2:"active"});
      }
    }
  }
});




});

app.get("/about", function(req, res) {
  res.render("about");
});

// Posts

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err,results){
      results.items.push(item);
      results.save();
      res.redirect("/"+listName);
    });
  }

});



app.post("/delete", function(req, res) {
  const itemChecked = req.body.checkbox;
  const listName = req.body.listName; //this is different listname from the post request.
  // console.log(listName);
  if(listName === "Today"){
    Item.deleteOne({_id: itemChecked},function(err,results){
      if(err){
        console.log(err);
      }else{
        // console.log("done");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemChecked}}},function(err,results){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }


});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
