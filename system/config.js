/* config.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that reads the configuration parameters for AssassinJS.

*/

var fs = require('fs');
var logger = require('./logger');

var dbconnect = require('./dbconnect');
var MyMongo = dbconnect.MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

var config = require('../config/config.json');

function reloadrqm(rqm)
{
try{logger.reloadrqm(rqm);}catch(err){console.log(err);}
logger = rqm.system.logger;
try{dbconnect.reloadrqm(rqm);}catch(err){console.log(err);}
dbconnect = rqm.system.dbconnect;
MyMongo = dbconnect.MyMongo;
db = new MyMongo('localhost', 27017, 'assassindb');
}

function getConfig()
{
	//logger.write('returning config = '+JSON.stringify(config));
	return config;
}

//function firsttime()
//this.prototype.firsttime = function(callback)
function firsttime(callback)
{
	if(config.firsttime != "false")
	{
		//Dropping Prev Collection Data
		DropPrevDB(function(){
		
		//To populate DB from routes file
		ReadRoutesFile(function(){
		
		//To populate DB from useragent file
		ReadUserAgentFile(function(){
		
		//To populate DB with empty analytics obj
		ReadAnalyticsFile(function(){
		
		//To populate DB with an empty obj for ratelimits
		ReadRateLimitFile(function(){
		
		//To populate DB  with an empty obj for ipblock
		ReadIPBlacklist(function(){
		
		//To populate DB with Default Login Info
		ReadLoginInfo(function(){
		
		//To popilate DB with Browsers Info
		ReadBrowsersFile(function(){
			initReadFromDB();
			config.firsttime = "false";
			fs.writeFileSync('./config/config.json',JSON.stringify(config));
			callback();
			return;
		});
		});
		});
		});
		});
		});
		});
		});
	}
	else
	{
		initReadFromDB();
		callback();
		return;
	}
}

// Used to drop previous values
function DropPrevDB(callback)
{
	logger.write('Dropping Previous AssassinJS Database Collections...','firsttime.js');
	db.query('routes',function(collection1){
		collection1.drop(function(err){
			if(err) logger.write(err,'config firsttime');
		
			db.query('filterParameters',function(collection2){
			
				collection2.drop(function(err){
					if(err) logger.write(err,'config firsttime');
					
					db.query('IPLogs',function(collection3){
						collection3.drop(function(err){
							if(err) logger.write(err,'config firsttime');
							
							db.query('Analytics',function(collection4){
								collection4.drop(function(err){
									if(err) logger.write(err,'config firsttime');
									logger.write('Finished Dropping Collections','firsttime.js');
									callback();
									return;
								});
							});
						});
					});
				});
			});
		});	
	});
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
function ReadAnalyticsFile(callback)
{
	logger.write('Initializing analytics Parameters into DB, please wait...','firsttime.js');	
	
	db.query('filterParameters',function(collection){
		var toset = require('../config/analytics.json');
		collection.update({filter:'analytics'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err) logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized the analytics collection in DB','firsttime.js');
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


function initReadFromDB()
{
	require('./router').ReadFromDB();
	require('../filters/analytics').ReadFromDB();
	require('../filters/browser').ReadFromDB();
	require('../filters/ipblock').ReadFromDB();
	require('../filters/rate-limit').ReadFromDB();
	require('../filters/user-agent').ReadFromDB();
	require('../filters/user-auth').ReadFromDB();
}


exports.firsttime = firsttime;
exports.getConfig = getConfig;
exports.config = config;
exports.reloadrqm = reloadrqm;