var path = require('path');
var childProcess = require('child_process');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


var express = require('express');  
const { json } = require('body-parser');
const { kill } = require('process');
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
  // console.log("---");
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
    var cellNum = req.body["cellNum"];
    var query = {cellNum: req.body["cellNum"]};
    var collection = "user_data";

    console.log(JSON.stringify(query) + "             " + cellNum);
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
  var toInsert = {cellNum: req.body["cellNum"],
                  bedTimeRule: '20:30',
                  bedTimeToggle: 'true',
                  dailyDigest: 'true',
                  gameLimitRule: '10',
                  gameLimitToggle: 'false',
                  monthlyDigest: 'false',
                  timeLimitRule: '180',
                  timeLimitToggle: 'false',
                  weeklyDigest: 'false'};
  console.log("trying to insert new cellNum: " + JSON.stringify(toInsert))

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
  //1. get the cell number from the http request______________________________________
  var query = { cellNum: req.body["cellNum"] };
  // console.log("The query is: " + JSON.stringify(query));

  //2. collect players last day games ordered by most recent___________________________________
  //Find date of most recent game
  var sortCriteria = { timeStamp: -1 };//sort by descending date and time
  var latestGameDate;
  try {
    latestGameDate = await sort(query, sortCriteria, "player_records", "growing_gamers", 1);
  } catch (error){
    console.log(error);
  }
  if(latestGameDate == null){
    console.log("ERROR: NULL RESULT");
  }
  // console.log("Single Element List: " + JSON.stringify(latestGameDate));
  latestGameDate = latestGameDate[0]["timeStamp"].substring(0, latestGameDate[0]["timeStamp"].indexOf(","));
  console.log("Latest Game Date is: " + latestGameDate);
  //find all games played on the most recent date
  query = { cellNum: req.body["cellNum"], timeStamp: new RegExp(latestGameDate) };
  console.log("query is: " +  JSON.stringify(query));
  var games;
  try {
    games = await sort(query, sortCriteria, "player_records", "growing_gamers");
  } catch (error){
    console.log(error);
  }
  if(games == null){
    console.log("ERROR: NULL RESULT");
  }
  // console.log("Sorted List: " + JSON.stringify(games));


  //3. Check if the bedtime rule is violated__________________________________________
  query = { cellNum: req.body["cellNum"] };
  var rules = await findOne(query, "user_data", "growing_gamers");
  console.log("The rules are: \n" + JSON.stringify(rules));
  var bedTimeViolation = await isBedTimeViolated(rules["bedTimeRule"], games[0]["timeStamp"].substring(games[0]["timeStamp"].indexOf(",")+2));
  console.log("BedTime Violation Staus: " + bedTimeViolation);

  
  //4. Check if playTime rule is violated_____________________________________________
  var playTime = await sumField("game_time", games);
  var playTimeViolation = await isPlayTimeViolated(parseInt(rules["timeLimitRule"])*60, playTime)
  console.log("PlayTime Violation Staus: " + playTimeViolation);


  //5. Check if gameLimit rule is violated____________________________________________
  var gameLimitViolation = await isGameLimitViolated(parseInt(rules["gameLimitRule"]), games.length);
  console.log("GameLimit Violation Status: " + gameLimitViolation);


  //6. Check performance______________________________________________________________
  var killDeathRatio = await ratio(games[0]["kills"], games[0]["deaths"]);
  console.log("Kill death ratio is: " + killDeathRatio);



  //X. Submit message ________________________________________________________________
  if(bedTimeViolation == "VIOLATION"){query = { messageID: "bedtimeviolated" };}
  else if(playTimeViolation == "VIOLATION"){query = { messageID: "playtimeviolated" };}
  else if(gameLimitViolation == "VIOLATION"){query = { messageID: "gamelimitviolated" };}
  else if(killDeathRatio > 1){query = { messageID: "doinggreat" };}
  else if(killDeathRatio < 0.5){query = { messageID: "takebreak" };}
  console.log(JSON.stringify(query));
  res.send(JSON.stringify(findOne(query, "app_messages", "growing_gamers")));

  console.log("---");
});
  

//*****************************MongoDB_Functions*****************************************************************************************
//Get one item from the user_data collection  
async function findOne(query, collectionSelected="user_data", database="growing_gamers"){
  const client = await MongoClient.connect(url, { useNewUrlParser: true }).catch(err => { console.log(err); });
  if (!client) {
    console.log("No client");
    return;
  } 
  try {
    const db = client.db(database);
    let collection = db.collection(collectionSelected);
    let result = await collection.findOne(query);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}


//get all matching items from player_records collection
async function findAll(query, collectionSelected="player_records", database="growing_gamers"){
  console.log("finding all");
  const client = await MongoClient.connect(url, { useNewUrlParser: true }).catch(err => { console.log(err); });
  if (!client) {
    console.log("No client");
    return;
  }
  try {
    const db = client.db(database);
    let collection = db.collection(collectionSelected);
    let result = await collection.find(query).toArray();
    console.log("returning: " + JSON.stringify(result));
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}


//get all matching items from a collection and sort by sortCriteria
async function sort(query, sortCriteria, collectionSelected="player_records", database="growing_gamers", limit=30){
  console.log("sorting");
  const client = await MongoClient.connect(url, { useNewUrlParser: true }).catch(err => { console.log(err); });
  if (!client) {
    console.log("No client");
    return;
  }

  try {
    const db = client.db(database);
    let collection = db.collection(collectionSelected);
    let result = await collection.find(query).sort(sortCriteria).limit(limit).toArray();
    console.log("returning: " + JSON.stringify(result));
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}



//*****************************Rule_Violation_Functions*****************************************************************************************
//Checks if bedtime rule is violated  bedtimeRule: string, time: string
async function isBedTimeViolated(bedTimeRule, time){
  if (time == null || bedTimeRule == null) {return "RULE_OR_TIMESTAMP_ERROR";}
  // console.log(bedTimeRule + "         " + time);
  if(time < bedTimeRule) {return "NO_VIOLATION";}
  else {return "VIOLATION";}
}

//Checks if playTime rule is violated  playTimeRule: number, playTime: number
async function isPlayTimeViolated(playTimeRule, playTime){
  if (playTime == null || playTimeRule == null) {return "RULE_OR_PLAYTIME_ERROR";}
  // console.log(playTimeRule + "         " + playTime);
  if(playTime < playTimeRule) {return "NO_VIOLATION";}
  else {return "VIOLATION";}
}

//Checks if gameLimit rule is violated  gameLimitRule: number, gamesPlayed: number
async function isGameLimitViolated(gameLimitRule, gamesPlayed){
  if (gamesPlayed == null || gameLimitRule == null) {return "RULE_OR_GAMESPLAYED_ERROR";}
  // console.log(gameLimitRule + "         " + gamesPlayed);
  if(gamesPlayed < gameLimitRule) {return "NO_VIOLATION";}
  else {return "VIOLATION";}
}


//*****************************Utility_Functions*****************************************************************************************
//Sums up the total value of a field, field may be a string or a number
async function sumField(field, array){
  var sum = 0;
  for (i in array){
    if(array[i][field]){ sum+=parseInt(array[i][field]); }
  }
  // console.log("sum is: " + sum);
  return sum;
}

//Calculates ratio numerator/denominator
async function ratio(num, denom) {
  var ratio;
  if (denom > 0){
    ratio = num/denom;
    if(ratio > 9){
      ratio = 9;
    }
  } else {
    ratio = 0;
  }
  return ratio;
}




//*****************************Digests**************************************************************************************************
async function dailyDigest(){
  var query = { dailyDigest: "true" };
  var dailyDigestSubscribers = findAll(query, "user_data", "growing_gamers");
  var date = new Date().toISOString.slice(0,10);
  console.log("date is: " + date);
  //Generate a daily digest for each subscriber
  var cellNum;
  for (i in dailyDigestSubscribers) {
    cellNum=i["cellNum"];
    console.log("cellNum is: " + cellNum);
  }
}

app.post('/test-daily-digest', async function(req, res){
  console.log("Running daily digest generator");
  var run = await dailyDigest();
  console.log("---");
});