
var logger = require('../system/logger');
var fs = require('fs');

var dbconnect = require('../system/dbconnect');
var MyMongo = dbconnect.MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

var browsers = {};

function reloadrqm(rqm)
{
logger.reloadrqm(rqm);
logger = rqm.system.logger;
dbconnect.reloadrqm(rqm);
dbconnect = rqm.system.dbconnect;
MyMongo = dbconnect.MyMongo;
db = new MyMongo('localhost', 27017, 'assassindb');
}

//Reading from db to get the user-agent parameters object
//ReadFromDB();//First Time Execution
function ReadFromDB()
{
	db.query('filterParameters',function(collection){		
				
		collection.findOne({filter:'browser'},function(err,item){
			browsers = item.parameters;
		});
		
	});	
}

function applyFilter(routesObj,request,response)
{
	var userAgent = request.headers['user-agent'];
	for(i in browsers)
	{
		if(browsers[i].url == routesObj.regexp)
		{
			var whitelist=browsers[i].params.allow;
			var blacklist=browsers[i].params.block;
		}
	}
	
	logger.write('user-agent header is '+userAgent,'filter browser.js');
	
	var browser ='';
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
	else
		browser='Other';
	
	logger.write('browser is '+browser,'filter browser.js');
	
	var filterobj = routesObj;
	if(whitelist != null && whitelist.length!=0)
	{
		if(whitelist.indexOf(browser)>-1)
		{
			filterobj.filterMessage = 'Allowed: WhiteListed. This is a browser filter and your browser is '+browser;
			filterobj.filterStatus = 200;
		}
		else
		{
			filterobj.filterMessage = 'Forbidden: Not WhiteListed. This is a browser filter and your browser is '+browser;
			filterobj.filterStatus = 403;				
		}
	}
	else if(blacklist != null && blacklist.length!=0)
	{
		if(blacklist.indexOf(browser)>-1)
		{
			filterobj.filterMessage = 'Forbidden: BlackListed. This is a browser filter and your browser is '+browser;
			filterobj.filterStatus = 403;

		}
		else
		{
			filterobj.filterMessage = 'Allowed: Not BlackListed. This is a browser filter and your browser is '+browser;
			filterobj.filterStatus = 200;			
		}			
	}
	else
	{
		filterobj.filterMessage = 'Filter Not Configured Properly. Your browser is '+browser;
		filterobj.filterStatus = 200;
	}
	return filterobj;
}

exports.applyFilter = applyFilter;
exports.ReadFromDB = ReadFromDB;
exports.reloadrqm = reloadrqm;