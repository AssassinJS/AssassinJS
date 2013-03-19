// test.js 
// this is a test filter

var logger = require('../system/logger');
var fs = require('fs');

var MyMongo = require('../system/dbconnect.js').MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

var userAgents = {};

//test entry in userAgents
userAgents['/filterbrowser']={'GET':{'allow':["Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17"],'block':[]}};

//Reading from db to get the user-agent parameters object
//ReadFromDB();//First Time Execution
function ReadFromDB()
{
	db.query('filterParameters',function(collection){		
				
		collection.findOne({filter:'user-agent'},function(err,item){
			userAgents = item.parameters;
		});
		
	});	
}

function applyFilter(routesObj,request,response)
{
	logger.write('UA OBJ = '+JSON.stringify(userAgents),'user-agent.js');

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
