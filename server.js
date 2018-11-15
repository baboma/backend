var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require("mongodb").MongoClient;
var md5 = require('md5');
var db;
var app = express();
app.use(bodyParser.raw({ type: '*/*' }))

const url = "mongodb://admin:password1@ds153093.mlab.com:53093/decodedb";

// Initialize connection once
MongoClient.connect(url, { useNewUrlParser: true }, (err, database) => {
  if(err) throw err;
  db = database;
  // Start the server after the database is ready
  app.listen(4000, () => { 
    console.log("Server started on port 4000");
  });
});

var create_UUID = () => {
  var dt = new Date().getTime();
  var uuid = 'xxxxxx4xxyxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

app.post("/login", (req, res) => {
  var parsed = JSON.parse(req.body);
  var thisemail = parsed.email;
  var thispassword = md5(parsed.password);
  //var thispassword = parsed.password; //...........//
  var mySearch;
  var dbo = db.db("decodedb");
  dbo.collection("users").find({}, { 
    projection: { _id: 0, email: 1, password: 1 } 
  }).toArray((err, result) => {
    if(err) throw err;
    mySearch = result.filter(user => {
      return user.email === thisemail && user.password === thispassword;
    })
    //debugger
    if(mySearch.length === 1){
      res.send(JSON.stringify({status: true}));
    } else {
      res.send(JSON.stringify({status: false}));
    }
  });
});

app.post("/signup", (req, res) => {
  var parsed = JSON.parse(req.body);
  var thisid = create_UUID();
  var thisemail = parsed.email;
  var thisusername = parsed.username;
  var thisname = parsed.name;
  var thisage = parsed.age;
  var thispassword = md5(parsed.password);
    var dbo = db.db("decodedb");
    var myobj = { 
      id: thisid, 
      email: thisemail, 
      username: thisusername, 
      name: thisname,
      age: thisage,
      password: thispassword, 
    };
    dbo.collection("users").insertOne(myobj, function(err, result) {
      if(err){
        throw err;
        //res.send(JSON.stringify({status: false, message:"Signup failed!"}));
      } else {
        res.send(JSON.stringify({status: true, message:"Signup successful!"}));
      }
    });
});

/*
app.get("/login", (req, res) => {
  MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      var dbo = db.db("decodedb");
      dbo.collection("users").find({}, {
        projection: { _id: 0, email: 1, password: 1 }
      }).toArray((err, result) => {
        if(err) throw err;
        db.close();
        res.send(JSON.stringify({ status:true, users: result }))
      })
  })
});
*/

