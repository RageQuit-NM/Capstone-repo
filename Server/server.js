var path = require('path');
var childProcess = require('child_process');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var express = require('express');  
var app = express();  

app.use(express.json())//So JSON data can be parsed from HTTP URL
app.use(express.static(__dirname+'/public'));//to know where the website assets live

app.get('/', function(req, res){
    var smsScript = childProcess.fork('./sms-messages/sms-test.js');
    res.send('test sms sent');
});

app.get('/parentPortal', function(req, res){
    res.sendFile(__dirname+"/parent-portal/parentPortal.html");
});

app.post('/get-settings', function(req, res){
  var object = req.body;
  var query = {cellNum: object["cellNum"]};
  var settingsResult;
  console.log("query is: " + JSON.stringify(query));

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var database = db.db("growing_gamers");
    database.collection("user_data").find(query).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      settingsResult = result;
      db.close();
    });
  });
  console.log("result: " + settingsResult);
  console.log("result stringiyed: " + JSON.stringify(settingsResult));

  res.send(JSON.stringify(settingsResult));
});

app.post('/send-message1', function(req, res){
    var cellNum = req.body["cellNum"];
    var smsScript = childProcess.fork('./sms-messages/message1.js');
    smsScript.send(cellNum);
    res.send('message 1 sms sent');
});



//Update the settings from the parent portal changes
app.post('/update-settings', function(req, res){
    var object = req.body;
    var query = {cellNum: object["cellNum"]};
    var newVals = { $set: object };
    var options = { upsert: true };

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var database = db.db("growing_gamers");
        database.collection("user_data").updateOne(query, newVals, options, function(err, res) {
          if (err) throw err;
          console.log("settings updated");
          db.close();
        });
      });

    res.send('settings succesfully updated');
});

//Add game stats to a log
app.post('/upload-game-data', function(req, res){
    var object = req.body;
    var options = { upsert: false };
  
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var database = db.db("growing_gamers");
        database.collection("player_records").insertOne(object, options, function(err, res) {
          if (err) throw err;
          console.log("player data entered");
          db.close();
        });
      });
  
    res.send('successfully uploaded user data');
  });
  
  
  app.listen(5000, function(){
      console.log('Node.js web server at port 5000 is running..')
  }); //listen for requests on port 5000
  
