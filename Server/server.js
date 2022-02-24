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
    console.log('test sms sent');
    res.send('test sms sent');
});

app.get('/parentPortal', function(req, res){
    res.sendFile(__dirname+"/parent-portal/parentPortal.html");
    console.log('Sent file: parentPortal.html');
});

app.post('/get-settings', async function(req, res){
  var object = req.body;
  var query = {cellNum: object["cellNum"]};
  //console.log("query is: " + JSON.stringify(query));
  var result;

  try {
    result = await findOne(query);
    //console.log("result: " + result);
  }
  catch (error){
    console.log(error);
  }
  console.log("Returing parentPortal settings: "+ JSON.stringify(result));
  res.send(JSON.stringify(result));
});

async function findOne(query){
  //console.log("finding one");
  const client = await MongoClient.connect(url, { useNewUrlParser: true }).catch(err => { console.log(err); });
  if (!client) {
    console.log("No client");
    return;
  }
  try {
  const db = client.db("growing_gamers");
  let collection = db.collection('user_data');
  let result = await collection.findOne(query);
  //console.log("returning: " + result);
  return result;
  }catch (err) {
    console.log(err);
  } finally {
    client.close();
    //console.log("returning: " + result);
    //return result;
  }
}

app.post('/bedtime-message', function(req, res){
    var cellNum = req.body["cellNum"];
    var smsScript = childProcess.fork('./sms-messages/bedtime-message.js');
    smsScript.send(cellNum);
    console.log("bedtime message sent to " + cellNum);
    res.send('Bedtime sms sent');
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
          console.log("settings updated: " + res);
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
          console.log("player data entered: " + res);
          db.close();
        });
      });
  
    res.send('successfully uploaded user data');
  });
  
  
  app.listen(5000, function(){
      console.log('Node.js web server at port 5000 is running..')
  }); //listen for requests on port 5000
  //End of server.js
