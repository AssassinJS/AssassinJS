// test.js 
// this is a test filter

var logger = require('../system/logger');
var fs = require('fs');

var dbconnect = require('../system/dbconnect');
var MyMongo = dbconnect.MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

var referers = {};

function reloadrqm(rqm)
{
try{logger.reloadrqm(rqm);}catch(err){console.log(err);}
logger = rqm.system.logger;
try{dbconnect.reloadrqm(rqm);}catch(err){console.log(err);}
dbconnect = rqm.system.dbconnect;
MyMongo = dbconnect.MyMongo;
db = new MyMongo('localhost', 27017, 'assassindb');
}

//Reading from db to get the user-agent parameters object
//ReadFromDB();//First Time Execution
function ReadFromDB()
{
	db.query('filterParameters',function(collection){		
				
		collection.findOne({filter:'referer'},function(err,item){
			referers = item.parameters;
			
			//test entry in referers
			//referers.url='GET/filterbrowser';
			//referers.params={'allow':["Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17"],'block':[]};
		
			//logger.write(JSON.stringify(referers),'user-agent filter');
		});
		
	});	
}

function applyFilter(routesObj,request,response)
{
	var referer = request.headers['referer'];
	for(i in referers)
	{
		if(referers[i].url == routesObj.regexp)
		{
			var whitelist=referers[i].params.allow;
			var blacklist=referers[i].params.block;
		}
	}
	
	logger.write('referer header is '+referer,'filters/test.js');
	
	var filterobj = routesObj;
	if(whitelist != null && whitelist.length!=0)
	{
		if(whitelist.indexOf(referer)>-1)
		{
			filterobj.filterMessage = 'Allowed: WhiteListed this is a referer filter and your referer is '+referer;
			filterobj.filterStatus = 200;
		}
		else
		{
			filterobj.filterMessage = 'Forbidden: Not WhiteListed this is a referer filter and your referer is '+referer;
			filterobj.filterStatus = 403;				
		}
	}
	else if(blacklist != null && blacklist.length!=0)
	{
		if(blacklist.indexOf(referer)>-1)
		{
			filterobj.filterMessage = 'Forbidden: BlackListed this is a referer filter and your referer is '+referer;
			filterobj.filterStatus = 403;

		}
		else
		{
			filterobj.filterMessage = 'Allowed: Not BlackListed this is a referer filter and your referer is '+referer;
			filterobj.filterStatus = 200;			
		}			
	}
	else
	{
		filterobj.filterMessage = 'Filter Not Configured Properly. Your referer is '+referer;
		filterobj.filterStatus = 200;
	}
	return filterobj;
}

function returnReferersObj()
{
	return referers;
}

exports.applyFilter = applyFilter;
exports.returnReferersObj = returnReferersObj;
exports.ReadFromDB = ReadFromDB;
exports.reloadrqm = reloadrqm;
