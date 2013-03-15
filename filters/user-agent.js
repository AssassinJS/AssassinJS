// test.js 
// this is a test filter

var logger = require('../system/logger');
var dbconnect = require('../system/dbconnect');
var fs = require('fs');

var userAgents = [];

//test entry in userAgents
userAgents['/filterbrowser']={'GET':{'allow':["Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17"],'block':[]}};


// Obsolete with database storage
// Is used only for first time initialization
function ReadUserAgentFile()
{
	var ua_data = fs.readFileSync('./config/useragent.txt');
	if(ua_data==null)
	{ 
		logger.write("useragent filter list data not found",'');
	}
	else
	{
		var listentries = ua_data.toString().split('\n');
		
		dbconnect.db_ready(function(db){
			var collection = db.collection('filterParameters');
			var toset = {};
			toset.parameters = {};
			toset.parameters.total = listentries;
			collection.update({filter:'user-agent'},{$set:toset},{upsert:true, w:1},function(err,data){
				if(err)logger.write(err,'user-agent.js');
			});			
		});
	}
}

//Reading from db to get the user-agent parameters object
ReadFromDB();//First Time Execution
function ReadFromDB()
{
	dbconnect.db_ready(function(db){
		
		var collection = db.collection('filterParameters');
				
		collection.findOne({filter:'user-agent'},function(err,item){
			userAgents = item.parameters;
		});			
	});	
}

function applyFilter(routesObj,request,response)
{
	var userAgent = request.headers['user-agent'];
	var whitelist=userAgents[routesObj.regexp][request.method].allow;
	var blacklist=userAgents[routesObj.regexp][request.method].block;
	logger.write('user-agent header is '+userAgent,'filters/test.js');
	
	/*var browser ='';
	if(userAgent.indexOf('Seamonkey')!=-1)
		browser='Seamonkey';
	else if(userAgent.indexOf('Firefox')!=-1)
		browser='Firefox';
	else if(userAgent.indexOf('Chromium')!=-1)
		browser='Chromium';
	else if(userAgent.indexOf('Chrome')!=-1)
		browser='Chrome';
	else if(userAgent.indexOf('Safari')!=-1)
		browser='Safari';
	else if(userAgent.indexOf('Opera')!=-1)
		browser='Opera';
	else if(userAgent.indexOf('MSIE')!=-1)
		browser='MSIE';
	*/
	var filterobj = routesObj;
	if(whitelist.length!=0)
	{
		if(whitelist.indexOf(userAgent)>-1)
		{
			filterobj.filterMessage = 'Allowed: WhiteListed this is a user-agent filter and your browser user-agent is '+userAgent;
			filterobj.filterStatus = 200;
		}
		else
		{
			filterobj.filterMessage = 'Forbidden: Not WhiteListed this is a user-agent filter and your browser user-agent is '+userAgent;
			filterobj.filterStatus = 403;				
		}
	}
	else
	{
		if(blacklist.indexOf(userAgent)>-1)
		{
			filterobj.filterMessage = 'Forbidden: BlackListed this is a user-agent filter and your browser user-agent is '+userAgent;
			filterobj.filterStatus = 403;

		}
		else
		{
			filterobj.filterMessage = 'Allowed: Not BlackListed this is a user-agent filter and your browser user-agent is '+userAgent;
			filterobj.filterStatus = 200;			
		}			
	}
	return filterobj;
}

exports.applyFilter = applyFilter;
exports.ReadUserAgentFile = ReadUserAgentFile;
