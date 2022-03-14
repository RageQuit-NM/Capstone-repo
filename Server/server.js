var path = require('path');
var childProcess = require('child_process');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


var express = require('express');  
const { json } = require('body-parser');
var app = express();  


app.use(express.json())//So JSON data can be parsed from HTTP URL
app.use(express.static(__dirname+'/public'));//to know where the website assets live


//listen for requests on port 5000
app.listen(5000, function(){
  console.log('Node.js web server at port 5000 is running..');
}); 


//********************************************GET Requests*************************************************
app.get('/', function(req, res){
    //var smsScript = childProcess.fork('./sms-messages/sms-test.js');
    console.log('Root directory accessed');
    res.send('Root directory accessed');
    console.log("---");
});


app.get('/parentPortal', function(req, res){
    res.sendFile(__dirname+"/parent-portal/parentPortal.html");
    console.log('Sent file: parentPortal.html');
    console.log("---");
});


//********************************************POST Requests*************************************************
//Collect the parental settings for a given cell number
app.post('/get-settings', async function(req, res){
  var query = {cellNum: req.body["cellNum"]};
  var collection = "user_data";
  var result;
  //console.log("searching for: " + JSON.stringify(query));
  try {
    result = await findOne(query, collection);
  } catch (error){
    console.log(error);
  }
  if(result == null){
    console.log("there was an error");
  }else{
    //console.log("Returing parentPortal settings. id: "+ JSON.stringify(result["_id"]) + " cellNum: " + JSON.stringify(result["cellNum"]));
  }
  res.send(JSON.stringify(result));
  //console.log("---");
});


//Collect the child performance stats for a given cell number
app.post('/get-stats', async function(req, res){
  var query = {cellNum: req.body["cellNum"]};
  var result;

  try {
    result = await findAll(query);
  } catch (error){
    console.log(error);
  }
  console.log("Returing parentPortal statistics: "+ JSON.stringify(result));
  res.send(JSON.stringify(result));
  console.log("---");
});


//Send bedtime violation notification
app.post('/bedtime-message', async function(req, res){
    var cellNum = req.body["cellNum"]; //req.body["cellNum"];
    result = await findOne(query, collection);
    if(result["bedTimeToggle"] == "true"){
      var smsScript = childProcess.fork('./sms-messages/bedtime-message.js');
      smsScript.send(cellNum);
      console.log("bedtime message sent to: " + cellNum);
      res.send('Bedtime sms sent');
    }else{
      console.log("bedtime message not sent to: " + cellNum + ". BedTimeToggle is set to: " + result["bedTimeToggle"]);
      res.send('Bedtime sms was not sent to parent.');
    }
    console.log("---");
});


//Insert a new cell num on itialization.
app.post('/insert-cellNum', async function(req, res){
  var toInsert = {cellNum: req.body["cellNum"]};
  console.log("trying to insert " + JSON.stringify(toInsert))

  const client = await MongoClient.connect(url, { useNewUrlParser: true }).catch(err => { console.log(err); });
  const db = client.db("growing_gamers");
  let collection = db.collection("user_data");

  var cellNumExists = await collection.findOne(toInsert);
  if(cellNumExists){
    console.log(JSON.stringify(toInsert) + " already exists in database. Not insertting.");
    res.send('This cell number already exists');
  }else{
    try{
      let result = await collection.insertOne(toInsert);
      console.log("inserted to database: " + JSON.stringify(result));
      res.send('succesfully inserted Cell Number');
    }
    catch(err){
      console.log(err);
      res.send('There was an error inserting.');
    }
  }
  client.close();
  console.log("---");
});



//Update the settings from the parent portal changes
app.post('/update-settings', function(req, res){
    var query = {cellNum: req.body["cellNum"]};
    var newVals = { $set: req.body };
    var options = { upsert: true };

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var database = db.db("growing_gamers");
        database.collection("user_data").updateOne(query, newVals, options, function(err, res) {
          if (err) throw err;
          console.log("settings updated: " + JSON.stringify(res));
          db.close();
        });
      });

    res.send('settings succesfully updated');
    console.log("---");
});


//Add game stats to a collection
app.post('/upload-game-data', function(req, res){
    var options = { upsert: false };
  
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var database = db.db("growing_gamers");
        database.collection("player_records").insertOne(req.body, options, function(err, res) {
          if (err) throw err;
          console.log("player data entered: " + JSON.stringify(res));
          db.close();
        });
      });
  
    res.send('successfully uploaded user data');
    console.log("---");
});


//Returns message based on message ID to the app
app.post('/get-message', async function(req, res){
  //1. get the cell number from the http request
  //var query = {cellNum: req.body["cellNum"]};
  var query = {cellNum: "3331234"};
  console.log(JSON.stringify(query));

  //2. find most recent game played
  var collection = "player_records"
  var result;
  
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var database = db.db("growing_gamers");
    var sortCriteria = { timeStampDay: -1, timeStampTime: -1 };
    database.collection("customers").find().sort(sortCriteria).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
    });
  });


  console.log("Sorted List: " + JSON.stringify(result));
  res.send(JSON.stringify(result));
  console.log("---");
});
  

//*****************************Functions*****************************************************************************************
//Get one item from the user_data collection  
async function findOne(query, collectionName){
  const client = await MongoClient.connect(url, { useNewUrlParser: true }).catch(err => { console.log(err); });
  if (!client) {
    console.log("No client");
    return;
  } 
  try {
    const db = client.db("growing_gamers");
    let collection = db.collection(collectionName);
    let result = await collection.findOne(query);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}


//get all matching items from player_records collection
async function findAll(query){
  console.log("finding all");
  const client = await MongoClient.connect(url, { useNewUrlParser: true }).catch(err => { console.log(err); });
  if (!client) {
    console.log("No client");
    return;
  }
  try {
    const db = client.db("growing_gamers");
    let collection = db.collection('player_records');
    let result = await collection.find(query).toArray();
    console.log("returning: " + JSON.stringify(result));
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}
