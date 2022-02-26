var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var database = db.db("growing_gamers");
    var options;
    database.collection("player_records").find({cellNum: "69"}, options, function(err, res) {
      if (err) throw err;
      console.log("player data collected: " + JSON.stringify(res));
      db.close();
    });
  });