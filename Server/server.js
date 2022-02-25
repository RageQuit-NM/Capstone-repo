var path = require('path');
var childProcess = require('child_process');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


var express = require('express');  
var app = express();  


app.use(express.json())//So JSON data can be parsed from HTTP URL
app.use(express.static(__dirname+'/public'));//to know where the website assets live


app.listen(5000, function(){
  console.log('Node.js web server at port 5000 is running..')
}); //listen for requests on port 5000


//********************************************Get Requests*************************************************
app.get('/', function(req, res){
    var smsScript = childProcess.fork('./sms-messages/sms-test.js');
    res.send('test sms sent');
});


app.get('/parentPortal', function(req, res){
    res.sendFile(__dirname+"/parent-portal/parentPortal.html");
});


//********************************************POST Requests*************************************************
//Collect the parental settings for a given cell number
app.post('/get-settings', async function(req, res){
  var object = req.body;
  var query = {cellNum: object["cellNum"]};
  console.log("query is: " + JSON.stringify(query));
  var result;

  try {
    result = await findOne(query);
  } catch (error){
    console.log(error);
  }
  console.log("3rd layer result is "+ JSON.stringify(result));
  res.send(JSON.stringify(result));
});

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//Collect the child performance stats for a given cell numberXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
app.post('/get-stats', async function(req, res){
  var object = req.body;
  var query = {cellNum: object["cellNum"]};
  console.log("query is: " + JSON.stringify(query));
  var result;

  try {
    result = await findOne(query);
  } catch (error){
    console.log(error);
  }
  console.log("3rd layer result is "+ JSON.stringify(result));
  res.send(JSON.stringify(result));
});
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

//Send bedtime violation notification
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


//Add game stats to a collection
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
  

// function searchDatabase(query){
//   console.log("query2 is: " + JSON.stringify(query));

//   var result2 = MongoClient.connect(url, async function(err, db) {
//     console.log("connecting");
//     if (err) throw err;
//     var database = db.db("growing_gamers");
//     var result1 = database.collection("user_data").find(query).toArray(function(err, result) {
//       if (err) throw err;
//       db.close();
//       console.log("collected: " + JSON.stringify(result));
//       //res.send(JSON.stringify(result));
//       return result;
//     });
//     console.log("returning " + JSON.stringify(result1));
//     return result1;
//   });
//   console.log("2nd layer result is " + JSON.stringify(result2));
//   return result2;
// }

//*****************************Functions*****************************************************************************************
//Get one item from the user_data collection  
async function findOne(query){
  console.log("finding one");
  const client = await MongoClient.connect(url, { useNewUrlParser: true }).catch(err => { console.log(err); });
  if (!client) {
    console.log("No client");
    return;
  }
  try {
    const db = client.db("growing_gamers");
    let collection = db.collection('user_data');
    let result = await collection.findOne(query);
    console.log(result);
    console.log("returning: " + result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}
  