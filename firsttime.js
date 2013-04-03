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
	var r_data = fs.readFileSync('./config/routes.txt');
	if(r_data==null)
	{ 
		logger.write("Routes data not found");
	}
	else
	{
		var listentries = r_data.toString().split('\n');
		
		db.query('routes',function(collection){				
				for(row in listentries)
				{
					var values = listentries[row].split('\t');
					if(values.length<2 || values.length>3) continue;
					var routeObj={};
					routeObj.regexp=values[0];
					routeObj.target=values[1];
					
					if(values.length==3) 
					{
						routeObj.filters=values[2].split(',');
					}
					
					collection.update({regexp:routeObj.regexp},{$set:routeObj},{upsert:true, w:1},function(err,data){
						if(err) logger.write(err);												
					});													
				}
				logger.write('Finished Initializing Routes','firsttime.js');			
		});
	}
}

// Is used only for first time initialization
function ReadUserAgentFile()
{
	logger.write('Populating user-agents into DB,please wait...','firsttime.js');
	var ua_data = fs.readFileSync('./config/useragent.txt');
	if(ua_data==null)
	{ 
		logger.write("useragent filter list data not found",'');
	}
	else
	{
		var listentries = ua_data.toString().split('\n');
		
		db.query('filterParameters',function(collection){
			var toset = {};
			toset.parameters = [];
			toset.paramsformat = ['allow','block'];
			toset.total = listentries;
			collection.update({filter:'user-agent'},{$set:toset},{upsert:true, w:1},function(err,data){
				if(err) logger.write(err,'user-agent.js');
				else if(data) logger.write('Initialized the user agent collection in DB','firsttime.js');
			});								
		});
	}
}

// Is used only for first time initialization
function ReadRateLimitFile()
{
	logger.write('Populating rate-limits into DB, please wait...','firsttime.js');	
	
	db.query('filterParameters',function(collection){
		var toset = {};
		toset.parameters = [];
		toset.paramsformat = ['limitNum','limitTime'];
		collection.update({filter:'rate-limit'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err) logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized the ratelimit collection in DB','firsttime.js');
		});
	});		
}

function ReadLoginInfo()
{
	logger.write('Populating default LoginInfo into DB, please wait...','firsttime.js');
	db.query('filterParameters',function(collection){
		var toset = { parameters : { admin : "password" } };
		collection.update({filter:'login'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err)	logger.write(err,'firsttime.js');
			else if(data) logger.write('Initialized LoginInfo in DB','firsttime.js');				
		});
	});
}

//To populate DB from routes file
ReadRoutesFile();
//To populate DB from useragent file
ReadUserAgentFile();
//To populate DB from ratelimit file with an empty obj
ReadRateLimitFile();
//To populate DB with Default Login Info
ReadLoginInfo();

//To Compile JSSP files to Views (production level - assuming that jssp's are already there)
var viewcompiler = require('./system/viewcompiler');
viewcompiler.readJSSP();
logger.write("compiled the JSSP's to Views",'firsttime.js');

logger.write('\n\n\tPress ctrl+c to exit...','firsttime.js');
