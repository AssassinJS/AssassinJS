//This filter implements blocking of requests based on IPs 
var logger = require('../system/logger');
var url = require('url');

var MyMongo = require('../system/dbconnect').MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

var IPBlacklist = [];

//To read from db
function ReadFromDB()
{
	db.query('filterParameters',function(collection){
		collection.find({filter:'ipblock'},{parameters:1}).nextObject(function(err,doc){				
				if(err)
				 	logger.write(JSON.stringify(err),'ipblock.js');
				else if(doc)				
					IPBlacklist = doc.parameters;									
		});
	});
}

//invokes the filter's functionality
function applyFilter(routesObj,request,response)
{
	var
	filterObj = routesObj,
	xfr = request.headers['x-forwarded-for'],	
	ip = xfr?xfr.split(', ')[0]:request.connection.remoteAddress,
	path = request.method + url.parse(request.url).pathname,
	urlReg = null,
	handled = false;
		
	logger.write('IP is : '+ip,'ipblock.js');
	
	//logger.write('IPBL = '+JSON.stringify(IPBlacklist),'ipblock.js');		
	
	for(index in IPBlacklist)
	{
		urlReg = new RegExp(IPBlacklist[index].url);
		
		//logger.write('IPBL Object = '+JSON.stringify(IPBlacklist[index]),'ipblock.js');
		
		if(urlReg.test(path))
		{
			if(IPBlacklist[index].params.iplist.indexOf(ip) != -1)
			{
				//ip is in blacklist
				handled = true;
				filterObj.filterMessage = 'Forbidden: IP '+ip+' has been blacklisted!';
				filterObj.filterStatus = 403;
				break;
			}
		}
	}
	
	if(!handled)
	{
		//ip is not in blacklist		
		filterObj.filterMessage = 'Allowed: IP '+ip+' has not been blacklisted.';
		filterObj.filterStatus = 200;
	}
	
	//read from db to memory obj after every request,because there is ui to sync this as of now
	//if there is a ui for ipblock, then this function must be called after every insert/update to ui 
	//ReadFromDB();
	
	return filterObj;	
}

//Populate on load, executes only once, when loaded for first time, during server start
//ReadFromDB();

exports.applyFilter = applyFilter;
exports.ReadFromDB = ReadFromDB;
