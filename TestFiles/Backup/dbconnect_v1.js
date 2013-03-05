var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Server = mongodb.Server
var db_global = '';
var collection = '';

// Define options. Note poolSize.
var serverOptions = {
  'auto_reconnect': true,
  'poolSize': 10
};
 
// Now create the server, passing our options.
//var serv = new mongodb.Server('localhost', 27017, serverOptions);
 
// At this point, there is no connection made to the server.
 
// Create a handle to the Mongo database called 'myDB'.
//var dbManager = new mongodb.Db('myDB', serv , {w:1});
 
// NOW we initialize ALL 10 connections:
//dbManager.open(function (error, db) {
  // Do something with the connection.
 // db_global = db;  
 // collection = db.collection('nodethings');
  
  // Make sure to call db.close() when ALL connections need to be shut down.
  //db.close();
//});

var customMC = new MongoClient(new Server('localhost', 27017, serverOptions),{w:1});

/*
customMC.open(function(err, mongoClient) {

  db_global = mongoClient.db("myDB");
  collection =  mongoClient.db("myDB").collection('nodethings');
  collection.find({name:'test'}).toArray(function(err,data){console.log(data)});
  //mongoClient.close();
  
});
*/

function dbWrapper(method)
{
	customMC.open(function(err, mongoclient){
		
		var db = mongoclient.db("myDB");
		collection = db.collection('nodethings');
		
		method();
		
		mongoclient.close();
		
	});
}

function getConnection()
{
	return db_global;
}

function getCollection()
{
	return collection;
}

exports.getConnection = getConnection;
exports.getCollection = getCollection;
exports.dbWrapper = dbWrapper;

