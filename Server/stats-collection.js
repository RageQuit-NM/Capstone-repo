// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/";



var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("growing_gamers");
  //Find all documents in the customers collection:
  dbo.collection("player_records").find({cellNum: 69}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
});


// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var database = db.db("growing_gamers");
//     var options = "";
//     var result = database.collection("player_records").find({cellNum: 69}, options);
//     console.log(JSON.stringify(result));
//   });