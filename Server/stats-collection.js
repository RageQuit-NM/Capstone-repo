var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


    var query = {cellNum: "69"};
    console.log("query is: " + JSON.stringify(query));
    var result;
  
    try {
      result = findMany(query).toArray();
    } catch (error){
      console.log(error);
    }
    console.log("Returning player stats "+ JSON.stringify(result));