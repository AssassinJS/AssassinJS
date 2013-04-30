/* firsttime.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that needs to be run for initializing the database the first time

*/
var fs = require('fs');
var logger = require('./system/logger');

var MyMongo = require('./system/dbconnect').MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

// Is used only for first time initialization
function ReadRoutesFile()
{
	logger.write('Reading routes from db,please wait...','firsttime.js');
	var r_data = require('./config/routes.json');
	db.query('routes',function(collection){				
		for(var x in r_data)
		{
			routeObj = r_data[x];
			collection.update({regexp:routeObj.regexp},{$set:routeObj},{upsert:true, w:1},function(err,data){
				if(err) logger.write(err);												
			});													
		}
		logger.write('Finished Initializing Routes','firsttime.js');			
	});
}

// Is used only for first time initialization
function ReadUserAgentFile()
{
	logger.write('Initializing user-agent Parameters into DB,please wait...','firsttime.js');
	db.query('filterParameters',function(collection){
		var toset = require('./config/useragent.json');
		collection.update({filter:'user-agent'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err) logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized the user agent collection in DB','firsttime.js');
		});								
	});
}

// Is used only for first time initialization
function ReadRateLimitFile()
{
	logger.write('Initializing rate-limit Parameters into DB, please wait...','firsttime.js');	
	
	db.query('filterParameters',function(collection){
		var toset = require('./config/ratelimit.json');
		collection.update({filter:'rate-limit'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err) logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized the ratelimit collection in DB','firsttime.js');
		});
	});		
}

// Is used only for first time initialization
function ReadIPBlacklist()
{
	logger.write('Initializing IP Blacklist parameters into DB, please wait...','firsttime.js');	
	
	db.query('filterParameters',function(collection){
		var toset = require('./config/ipblacklist.json');
		collection.update({filter:'ipblock'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err) logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized the ipblock collection in DB','firsttime.js');
		});
	});		
}

// Is used only for first time initialization
function ReadLoginInfo()
{
	logger.write('Populating default LoginInfo into DB, please wait...','firsttime.js');
	
	db.query('filterParameters',function(collection){
		var toset = require('./config/logininfo.json');
		collection.update({filter:'login'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err)	logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized LoginInfo in DB','firsttime.js');				
		});
	});
}

// Is used only for first time initialization
function ReadBrowsersFile()
{
	logger.write('Initializing browser Parameters into DB,please wait...','firsttime.js');
	db.query('filterParameters',function(collection){
		var toset = require('./config/browser.json');
		collection.update({filter:'browser'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err) logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized the browser collection in DB','firsttime.js');
		});								
	});
}

//To populate DB from routes file
ReadRoutesFile();
//To populate DB from useragent file
ReadUserAgentFile();
//To populate DB with an empty obj for ratelimits
ReadRateLimitFile();
//To populate DB  with an empty obj for ipblock
ReadIPBlacklist();
//To populate DB with Default Login Info
ReadLoginInfo();
//To popilate DB with Browsers Info
ReadBrowsersFile();

//To Compile JSSP files to Views (production level - assuming that jssp's are already there)
var viewcompiler = require('./system/viewcompiler');
viewcompiler.readJSSP();
logger.write("compiled the JSSP's to Views",'firsttime.js');

logger.write('\n\n\tPress ctrl+c to exit...','firsttime.js');
