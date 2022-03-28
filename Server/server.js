var path = require('path');
var childProcess = require('child_process');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var fs = require('fs');
var express = require('express');  
var app = express();  

var schedule = require('node-schedule');
var dailyDigestJob = schedule.scheduleJob('* * 21 * * *', function(){
  console.log("Running daily digest job");
  dailyDigest();
  console.log("---");
});

var options = {
  key: fs.readFileSync('client-key.pem'),
  cert: fs.readFileSync('client-cert.pem')
};

app.use(express.json());//So JSON data can be parsed from HTTP URL
app.use(express.static(__dirname+'/public'));//to know where the website assets live

var https = require('https');
https.createServer(options, app).listen(5001);  //HTTPS service
console.log('Node.js HTTPS web server at port 5001 is running..');


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

//Generate and send random code to a cell number
app.post('/send-code', async function(req, res){
  var expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 1);
  var enterDate = expirationDate.toLocaleString('en-CA', {hour12:false});
  //var expirationDate = new Date().getDate() + 1;  //Set the expiration date to 1 day later
  var crypto = require("crypto");
  var possibleEntires = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  var code = "";
  for (var i=0; i<4; i++){
    code += possibleEntires.charAt(crypto.randomInt(0, possibleEntires.length));
  }

  var query = {cellNum: req.body["cellNum"], code: code, expirationDate: enterDate};
  var collection = "codes";

  var result;
  //console.log("searching for: " + JSON.stringify(query));
  try {
    result = await insertOne(query, collection);
  } catch (error){
    console.log(error);
  }

  var message = {cellNum: req.body["cellNum"], body: "Your access code is: " + code};
  var smsScript = childProcess.fork('./sms-messages/sendSMS.js');
  smsScript.send(message);

  res.send("Code generated successfully");
  console.log("Result of new code inserted to database: " + JSON.stringify(result));

  console.log("---");
});

//Generate and send random code to a cell number
app.post('/verify-code', async function(req, res){
  var query = {cellNum: req.body["cellNum"], code: req.body["code"]};
  var collection = "codes";

  console.log("querying to verify: " + JSON.stringify(query));
  var result;
  //console.log("searching for: " + JSON.stringify(query));
  try {
    result = await findOne(query, collection);
  } catch (error){
    console.log(error);
  }
  if(result == null){
    res.send("INVAILD_CODE");
    console.log('A user attempted to verify code with an invalid code. Cell: ' + req.body["cellNum"] + " and code " + req.body["code"]);
  }else{
    var currentDate = new Date().toLocaleString('en-CA', {hour12:false});
    if (currentDate > result["expirationDate"]){
      res.send("INVAILD_CODE_EXPIRED");
      console.log('Code not verified. Expired');
    }else{
      res.send("VAILD_CODE");
      console.log('A code was verified');
    }
  }
  console.log("---");
});



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
    console.log("NO CELLNUM FOUND: " + JSON.stringify(query));
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

app.post('/get-info-for-child', async function(req, res){
  var query = {cellNum: req.body["cellNum"]};
  var collection = "user_data";
  var result;
  try {
    result = await findOne(query, collection);
  } catch (error){
    console.log(error);
  }

  let currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12:false});
  let hoursLeft = parseInt(result["bedTimeRule"]) - parseInt(currentTime);
  let minutesLeft = parseInt(result["bedTimeRule"].substring(result["bedTimeRule"].indexOf(":")+1)) - parseInt(currentTime.substring(currentTime.indexOf(":")+1));
  if (minutesLeft < 0){
    hoursLeft -= 1;
    minutesLeft += 60;
  }
  let timeLeft = hoursLeft + ":" + minutesLeft;
  sendObject = {timeLeft};

  let maxGames = result["gameLimitRule"];
  let gamesLeft;

  let maxPlaySession = result["timeLimitRule"];
  let playSessionLeft;

  console.log("Info for child: " + JSON.stringify(sendObject));
  res.send(JSON.stringify(sendObject));
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
app.post('/update-settings', async function(req, res){
  var verificationQuery = {cellNum: req.body["cellNum"], code: req.body["code"]};
  var verificationCollection = "codes";

  var result;
  try {
    result = await findOne(verificationQuery, verificationCollection);
  } catch (error){
    console.log(error);
  }
  if(result == null){
    res.send("INVAILD_CODE");
    console.log('A user attempte to submit update settings to ' + req.body["cellNum"] + ' with the invalid code: ' + req.body["code"]);
    console.log("---");
    return;
  }

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
  console.log("/get-message for " + req.body["cellNum"]);
  // console.log("The query is: " + JSON.stringify(query));

  //2. collect players last day games ordered by most recent___________________________________
  //Find date of most recent game
  var sortCriteria = { timeStamp: -1 };//sort by descending date and time
  var latestGameDate;
  try {
    console.log("Query for latest game date is: " + JSON.stringify(query));
    latestGameDate = await sort(query, sortCriteria, "player_records", "growing_gamers", 1);
    console.log("Response is: " + JSON.stringify(latestGameDate));
  } catch (error){
    console.log(error);
  }
  if(latestGameDate == null || typeof latestGameDate == 'undefined'){//If there are no games found, return default message
    console.log("ERROR: NULL RESULT " + typeof latestGameDate);
    query = { messageID: "welcomeback" };
    console.log(JSON.stringify(query));
    res.send(JSON.stringify(findOne(query, "app_messages", "growing_gamers")));

    console.log("---");
    return;
  }
  console.log("Single Element List: " + JSON.stringify(latestGameDate));
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
  // console.log("The rules are: \n" + JSON.stringify(rules));
  var bedTimeViolation = await isBedTimeViolated(rules["bedTimeRule"], games[0]["timeStamp"].substring(games[0]["timeStamp"].indexOf(",")+1).trim());
  console.log("BedTime Violation Status: " + bedTimeViolation);
  // console.log("cellNum is: " + query["cellNum"]);
  if(bedTimeViolation == "VIOLATION") { await logViolation(query["cellNum"], "bedTimeViolation", games[0]["timeStamp"]); }

  
  //4. Check if playTime rule is violated_____________________________________________
  var playTime = await sumField("game_time", games);
  var playTimeViolation = await isPlayTimeViolated(parseInt(rules["timeLimitRule"])*60, playTime)
  console.log("PlayTime Violation Status: " + playTimeViolation);


  //5. Check if gameLimit rule is violated____________________________________________
  var gameLimitViolation = await isGameLimitViolated(parseInt(rules["gameLimitRule"]), games.length);
  console.log("GameLimit Violation Status: " + gameLimitViolation);


  //6. Check performance______________________________________________________________
  var killDeathRatio = await ratio(games[0]["kills"], games[0]["deaths"]);
  console.log("Kill death ratio is: " + killDeathRatio);



  //X. Submit message ________________________________________________________________
  if(bedTimeViolation == "VIOLATION") { 
    query = { messageID: "bedtimeviolated" };
    await ruleSMS(req.body["cellNum"], "Your child has violated their bedtime.", "bedTimeToggle");
 }
  else if(playTimeViolation == "VIOLATION") { 
    query = { messageID: "playtimeviolated" }; 
    await ruleSMS(req.body["cellNum"], "Your child has violated their play time limit.", "timeLimitToggle");
  }
  else if(gameLimitViolation == "VIOLATION") { 
    query = { messageID: "gamelimitviolated" }; 
    await ruleSMS(req.body["cellNum"], "Your child has violated their game limit.", "gameLimitToggle");
  }
  else if(killDeathRatio > 1) { query = { messageID: "doinggreat" }; }
  else if(killDeathRatio < 0.5) { query = { messageID: "takebreak" }; }
  else {query = { messageID: "welcomeback" }; }
 
  res.send(JSON.stringify(await findOne(query, "app_messages", "growing_gamers")));
  console.log("Overwolf message sent" + query);

  console.log("---");
  return;
});
  

//*****************************MongoDB_Functions*****************************************************************************************
//Get one item from the user_data collection  
async function findOne(query, collectionSelected="user_data", database="growing_gamers") {
  const client = await MongoClient.connect(url, { useNewUrlParser: true } ).catch(err => { console.log(err); });
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
async function findAll(query, collectionSelected="player_records", database="growing_gamers") {
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
    // console.log("returning: " + JSON.stringify(result));
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}


//get all matching items from a collection and sort by sortCriteria
async function sort(query, sortCriteria, collectionSelected="player_records", database="growing_gamers", limit=30) {
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
    // console.log("returning: " + JSON.stringify(result));
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}


//updateOne
async function updateOne(query, newVals, options, collectionSelected="player_records", database="growing_gamers") {
    console.log("updatingOne");
    const client = await MongoClient.connect(url, { useNewUrlParser: true }).catch(err => { console.log(err); });
    if (!client) {
      console.log("No client");
      return;
    }

    console.log("Query is: " + JSON.stringify(query));
    console.log("Options are: " + JSON.stringify(options));
    try {
      const db = client.db(database);
      let collection = db.collection(collectionSelected);
      let result = await collection.updateOne(query, newVals, options);
      console.log("returning: " + JSON.stringify(result));
      return result;
    } catch (err) {
      console.log(err);
    } finally {
      client.close();
    }
}

//insertOne
async function insertOne(query, collectionSelected="player_records", database="growing_gamers") {
  console.log("insertingOne");
  const client = await MongoClient.connect(url, { useNewUrlParser: true }).catch(err => { console.log(err); });
  if (!client) {
    console.log("No client");
    return;
  }
  console.log("Query is: " + JSON.stringify(query));
  try {
    const db = client.db(database);
    let collection = db.collection(collectionSelected);
    let result = await collection.insertOne(query);
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
  else {
    return "VIOLATION";
  }
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

async function logViolation(cellNum, violation, timeStamp) {
  var query = { cellNum: cellNum, violation: violation, timeStamp: timeStamp };
  var options = { upsert: true };
  console.log("query is: " + JSON.stringify(query));

  try {
    var logged = await updateOne(query, { $set: query }, options, "player_records", "growing_gamers");
    return logged;
  } catch (error){
    console.log(error);
  }
  if(logged == null){
    console.log("ERROR: NULL RESULT");
  }
}

//Send a rule violation sms to parent
async function ruleSMS(cellNum, body, rule) {
  var parentPreferences = await findOne(query, "user_data");
  if(parentPreferences[rule] == "true"){
    sendSMS(cellNum, body);
    console.log("ruleSMS sent");
  }else{
    console.log("ruleSMS not sent: " + rule + " " + parentPreferences[rule]);
  }
  console.log("---");
}


//Send an sms
async function sendSMS(cellNum, body) {
  var query = {cellNum: cellNum};
  var message = { cellNum: cellNum, body: body};
  var smsScript = childProcess.fork('./sms-messages/sendSMS.js');
  smsScript.send(message);

  console.log("SMS sent: " + JSON.stringify(message));
  console.log("---");
}


//*****************************Utility_Functions*****************************************************************************************
//Sums up the total value of a field, field may be a string or a number
async function sumField(field, array){
  var sum = 0;
  for (i in array) {
    if (array[i][field]) { sum+=parseInt(array[i][field]); }
  }
  // console.log("sum is: " + sum);
  return sum;
}

//Calculates ratio numerator/denominator
async function ratio(num, denom) {
  var ratio;
  if (denom > 0) {
    ratio = num/denom;
    if (ratio > 9) { ratio = 9; }
  } else { ratio = 0; }
  return ratio;
}

//returns the number of true bools or strings for a given field in given array items
async function sumBools(field, array) {
  var sum = 0;
  for (i in array) {
    if (array[i][field]) {
      if (array[i][field] === true || array[i][field] == "true") { sum ++; }
    }
  }
  return sum;
}



//*****************************Digests**************************************************************************************************
async function dailyDigest(){
  //1. Find everyone who is subscribed to daily digests
  console.log("Generating Digests");
  var query = { dailyDigest: "true" };
  var sortCriteria = { timeStamp: -1 }; //sort by largest to smallest time stamp
  var dailyDigestSubscribers;

  try {
    dailyDigestSubscribers = await findAll(query, "user_data", "growing_gamers");
  } catch (error){
    console.log(error);
  }
  if(dailyDigestSubscribers == null){
    console.log("ERROR: NULL RESULT");
  }

  //2. Generate a daily digest for each subscriber
  var date = new Date().toLocaleString('en-CA', {hour12:false}); //todays date YYYY-MM-DD
  date = date.substring(0,10);
  console.log("date is: " + date);
  var cellNum;    //cellNum of current subscriber
  var wins;       //number of wins of current subscriber
  var gamesPlayed;//number of games played
  var winLossRatio;//Win/loss ratio
  var timePlayed; //time played today
  var timeStopped;//timestamp of last game
  var games;      //total number of games played today
  var violations; //list of violations incurred today by user
  var body;       //Final message to be sent out (The final digest)

  for (i in dailyDigestSubscribers) {
    cellNum=dailyDigestSubscribers[i]["cellNum"];
    console.log("cellNum is: " + cellNum);

    //Collect this players daily games___________________________________________________________
    query = { cellNum: cellNum, timeStamp: new RegExp(date.toString()), violation: null };
    console.log("query is: " + JSON.stringify(query));
    try {
      games = await sort(query, sortCriteria,"player_records", "growing_gamers");
    } catch (error){
      console.log(error);
    }
    if(games == null){
      console.log("ERROR: NULL RESULT");
    }
    console.log("games are: " + JSON.stringify(games));
    
    //Get wins_________________________________________________________________________________
    wins = await sumBools("win", games);
    console.log("Wins is: " + wins);

    //Games Played_____________________________________________________________________________
    gamesPlayed = games.length;
    console.log("Games played is: " + gamesPlayed);

    //Get win/loss ratio_______________________________________________________________________
    winLossRatio = ratio(wins, gamesPlayed);
    console.log("KDR is: " + winLossRatio);

    //Rule violations___________________________________________________________________________
    query = { cellNum: cellNum, timeStamp: new RegExp(date.toString()), violation: { $ne:null } };
    console.log("query is: " + JSON.stringify(query));
    try {
      violations = await sort(query, sortCriteria,"player_records", "growing_gamers");
    } catch (error){
      console.log(error);
    }
    if(violations == null){
      console.log("ERROR: NULL RESULT");
    }
    console.log("Violations are: " + JSON.stringify(violations));

    //Play Time (minutes)______________________________________________________________________
    timePlayed = await sumField("game_time", games);
    timePlayed = timePlayed/60;
    console.log("time played is: " + timePlayed);

    //Time Stopped_____________________________________________________________________________
    if (gamesPlayed > 0) {
      timeStopped = games[0]["timeStamp"].substring(games[0]["timeStamp"].indexOf(',')+1).trim();
    } else {
      timeStopped = "NA";
    }
    console.log("Time stopped is: " + timeStopped);

    //Send SMS_________________________________________________________________________________
    body = date + " Daily Digest: \n";
    if(gamesPlayed == 0 || gamesPlayed == null) {
      body = body + "No Activity Today.";
    } else {
      body = body + "Wins: " + wins + "\n";
      body = body + "Games Played: " + gamesPlayed + "\n";
      body = body + "Time Played: " + timePlayed + "\n";
      body = body + "Time Stopped: " + timeStopped+ "\n";
      if(violations != null){//TEST THIS PARTXXXXXXXXXXXXXXXXXXXXXXXXXXX
        body = body + "Rule Violations: " + "\n";
        for (i in violations) {
          body = body + i + ". " + violations[i]["violation"] + "\n";
        }
      }
      body = body + "Remember to encourage them, let them know they're awesome!";
    }
    await sendSMS(cellNum, body);
  }
}

//Function to test digest distribution
app.post('/test-daily-digest', async function(req, res){
  console.log("Running daily digest generator");
  var run = await dailyDigest();
  console.log("---");
});