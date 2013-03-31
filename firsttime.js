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
					if(values.length<3 || values.length>4) continue;
					var routeObj={};
					routeObj.path=values[1];
					routeObj.method=values[0];
					routeObj.target=values[2];
					var toSet={};
					toSet[routeObj.method] = routeObj.target;
					if(values.length==4) 
					{
						routeObj.filters=values[3].split(',');
						toSet.filters = {};
						toSet.filters[routeObj.method] = routeObj.filters;
					}
					collection.update({regexp:routeObj.path},{$set:toSet},{upsert:true, w:1},function(err,data){
						if(err)logger.write(err);						
					});			
				}
				
				logger.write('Finished Initializing Routes','firsttime.js');
		
		});
	}
}

// Is used only for first time initialization
function ReadUserAgentFile()
{
	logger.write('Reading user-agents from db,please wait...','firsttime.js');
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
			toset.parameters = {};
			toset.parameters.total = listentries;
			collection.update({filter:'user-agent'},{$set:toset},{upsert:true, w:1},function(err,data){
				if(err)logger.write(err,'user-agent.js');
			});
			
			logger.write('initialized the user agent collection in db','firsttime.js');			
		});
	}
}

// Is used only for first time initialization
function ReadRateLimitFile()
{
	logger.write('Reading user-agents from db,please wait...','firsttime.js');
	var ua_data = fs.readFileSync('./config/useragent.txt');
	if(ua_data==null)
	{ 
		logger.write("useragent filter list data not found",'');
		var toset = {};
		collection.update({filter:'rate-limit'},{$set:toset},{upsert:true, w:1},function(err,data){
			if(err)logger.write(err,'firsttime.js');
		});
	}
	else
	{
		var listentries = ua_data.toString().split('\n');
		
		db.query('filterParameters',function(collection){

			var toset = {};
			toset.parameters = [];
			//toset.parameters.total = listentries;
			collection.update({filter:'rate-limit'},{$set:toset},{upsert:true, w:1},function(err,data){
				if(err)logger.write(err,'firsttime.js');
			});
			
			logger.write('initialized the user agent collection in db','firsttime.js');			
		});
	}
}

//To populate db from routes file
ReadRoutesFile();
//To populate db from useragent file
ReadUserAgentFile();
//To populate db from ratelimit file if it exists or else an empty obj
ReadRateLimitFile();

//To Compile JSSP files to Views (production level - assuming that jssp's are already there)
var viewcompiler = require('./system/viewcompiler');
viewcompiler.readJSSP();
logger.write("compiled the JSSP's to Views",'firsttime.js');

logger.write('\n\n\tPress ctrl+c to exit...','firsttime.js');
