var path = require('path');
var childProcess = require('child_process');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


var express = require('express');  
var app = express();  


app.use(express.json())//So JSON data can be parsed from HTTP URL
app.use(express.static(__dirname+'/public'));//to know where the website assets live


//listen for requests on port 5000
app.listen(5000, function(){
  console.log('Node.js web server at port 5000 is running..')
}); 


//********************************************GET Requests*************************************************
app.get('/', function(req, res){
    //var smsScript = childProcess.fork('./sms-messages/sms-test.js');
    console.log('Root directory accessed');
    res.send('Root directory accessed');
});


app.get('/parentPortal', function(req, res){
    res.sendFile(__dirname+"/parent-portal/parentPortal.html");
    console.log('Sent file: parentPortal.html');
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
});


//Send bedtime violation notification
app.post('/bedtime-message', function(req, res){
    var bedTime = req.body["bedTime"]; //req.body["cellNum"];
    var smsScript = childProcess.fork('./sms-messages/bedtime-message.js');
    smsScript.send(bedTime);
    console.log("bedtime message sent with bedtime: " + bedTime);
    res.send('Bedtime sms sent');
});


//Insert a new cell num on itialization.
app.post('/insert-cellNum', async function(req, res){
  var toInsert = {cellNum: req.body["cellNum"]};
  console.log("trying to insert " + JSON.stringify(toInsert))

  const client = await MongoClient.connect(url, { useNewUrlParser: true }).catch(err => { console.log(err); });
  const db = client.db("growing_gamers");
  let collection = db.collection(user_data);

  var cellNumExists = await collection.exists(toInsert);

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
    // MongoClient.connect(url, function(err, db) {
    //     if (err) throw err;
    //     var database = db.db("growing_gamers");
    //     database.collection("user_data").insertOne(toInsert, function(err, res) {
    //       if (err) throw err;
    //       console.log("inserted to database: " + JSON.stringify(res));
    //       db.close();
    //     });
    //   });
  }
  client.close();
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
});


//Returns message based on message ID to the app
app.post('/get-message', async function(req, res){
  var query = {messageID: req.body["messageID"]};
  console.log(JSON.stringify(query));
  var collection = "app_messages"
  var result;

  try {
    result = await findOne(query, collection);
  } catch (error){
    console.log(error);
  }
  console.log("Returning app message: " + JSON.stringify(result));
  res.send(JSON.stringify(result));
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
