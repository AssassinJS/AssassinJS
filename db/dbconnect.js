var mongodb = require('mongodb');
var global_db  = '';

// Define options. Note poolSize.
var serverOptions = {
   'auto_reconnect': true,
   'poolSize': 5
};

// Now create the server, passing our options.
var serv = new mongodb.Server('localhost', 27017, serverOptions);

// At this point, there is no connection made to the server.

// Create a handle to the Mongo database called 'myDB'.
var dbManager = new mongodb.Db('myDB', serv, {w:1});

var on_db_ready = null;

module.exports = {
               		 db_ready:function(db_ready_callback){
                   		  on_db_ready = db_ready_callback;
                    	 //here we call callback if already have db
                     	if (global_db) on_db_ready(global_db);
                	 },
                 	getConnection:getConnection
                };
                
dbManager.open(function (error, db) {
 if (on_db_ready) on_db_ready(db);
  global_db = db;
});

function getConnection()
{
   return global_db;
} 

