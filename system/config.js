/* config.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that reads the configuration parameters for AssassinJS.

*/

var fs = require('fs');
var logger = require('./logger');

var MyMongo = require('./dbconnect').MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

var config = require('../config/config.json');

function getConfig()
{
	logger.write('returning config = '+JSON.stringify(config));
	return config;
}

//function firsttime()
//this.prototype.firsttime = function(callback)
function firsttime(callback)
{
	if(config.firsttime != false)
	{
		
		//To populate DB from routes file
		ReadRoutesFile(function(){
		
		//To populate DB from useragent file
		ReadUserAgentFile(function(){
		
		//To populate DB with an empty obj for ratelimits
		ReadRateLimitFile(function(){
		
		//To populate DB  with an empty obj for ipblock
		ReadIPBlacklist(function(){
		
		//To populate DB with Default Login Info
		ReadLoginInfo(function(){
		
		//To popilate DB with Browsers Info
		ReadBrowsersFile(function(){
			config.firsttime = false;
			fs.writeFileSync('./config/config.json',JSON.stringify(config));
			callback();
			return;
		});
		});
		});
		});
		});
		});
	}
	else
	{
		callback();
		return;
	}
}

// Is used only for first time initialization
function ReadRoutesFile(callback)
{
	logger.write('Reading routes from db,please wait...','firsttime.js');
	var r_data = require('../config/routes.json');
	db.query('routes',function(collection){				
		for(var x in r_data)
		{
			routeObj = r_data[x];
			collection.update({regexp:routeObj.regexp},{$set:routeObj},{upsert:true, w:1},function(err,data){
				if(err) logger.write(err);												
			});													
		}
		logger.write('Finished Initializing Routes','firsttime.js');
		callback();
		return;
	});
}

// Is used only for first time initialization
function ReadUserAgentFile(callback)
{
	logger.write('Initializing user-agent Parameters into DB,please wait...','firsttime.js');
	db.query('filterParameters',function(collection){
		var toset = require('../config/useragent.json');
		collection.update({filter:'user-agent'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err) logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized the user agent collection in DB','firsttime.js');
			callback();
			return;
		});
	});
}

// Is used only for first time initialization
function ReadRateLimitFile(callback)
{
	logger.write('Initializing rate-limit Parameters into DB, please wait...','firsttime.js');	
	
	db.query('filterParameters',function(collection){
		var toset = require('../config/ratelimit.json');
		collection.update({filter:'rate-limit'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err) logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized the ratelimit collection in DB','firsttime.js');
			callback();
			return;
		});
	});		
}

// Is used only for first time initialization
function ReadIPBlacklist(callback)
{
	logger.write('Initializing IP Blacklist parameters into DB, please wait...','firsttime.js');	
	
	db.query('filterParameters',function(collection){
		var toset = require('../config/ipblacklist.json');
		collection.update({filter:'ipblock'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err) logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized the ipblock collection in DB','firsttime.js');
			callback();
			return;
		});
	});		
}

// Is used only for first time initialization
function ReadLoginInfo(callback)
{
	logger.write('Populating default LoginInfo into DB, please wait...','firsttime.js');
	
	db.query('filterParameters',function(collection){
		var toset = require('../config/logininfo.json');
		collection.update({filter:'login'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err)	logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized LoginInfo in DB','firsttime.js');
			callback();
			return;
		});
	});
}

// Is used only for first time initialization
function ReadBrowsersFile(callback)
{
	logger.write('Initializing browser Parameters into DB,please wait...','firsttime.js');
	db.query('filterParameters',function(collection){
		var toset = require('../config/browser.json');
		collection.update({filter:'browser'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err) logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized the browser collection in DB','firsttime.js');
			callback();
			return;
		});		
	});
}

exports.firsttime = firsttime;
exports.getConfig = getConfig;