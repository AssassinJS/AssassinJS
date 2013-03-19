var mongodb = require('mongodb');
var logger = require('./logger');
var global_db  = '';
var on_db_ready = null;

//DB Details
var db_details = [];
db_details['username'] = '';
db_details['password'] = '';
db_details['location'] = 'localhost';
db_details['port_num'] = 27017;
db_details['name'] = 'assassindb';

// Define options. Note poolSize.
var serverOptions = {
   'auto_reconnect': true,
   'poolSize': 10
};

// Now create the server, passing our options.
var serv = new mongodb.Server(db_details['location'], db_details['port_num'], serverOptions);

// At this point, there is no connection made to the server.

// Create a handle to the Mongo database called 'myDB'.
var dbManager = new mongodb.Db(db_details['name'], serv, {w:1});

dbManager.open(function (error, db) {

 if (on_db_ready) on_db_ready(db);
  global_db = db;
  
});

function getConnection()
{
   return global_db;
} 

function db_ready(db_ready_callback){

  on_db_ready = db_ready_callback;
  
  //here we call callback if already have db
  if (global_db) db_ready_callback(global_db);
                     	
}

function db_do(db_perform){

	dbManager.open(function (error, db) {
 
 			db_perform(db);
 
	});
	
}
	
module.exports = {
               		db_ready : db_ready,
               		db_do : db_do,
                 	getConnection : getConnection
};
                


