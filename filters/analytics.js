//This filter implements analytics dumping of requests based on IPs and Preset URLs 
var logger = require('../system/logger');
var url = require('url');

var dbconnect = require('../system/dbconnect');
var MyMongo = dbconnect.MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

var Analytics = {};

function reloadrqm(rqm)
{
try{logger.reloadrqm(rqm);}catch(err){console.log(err);}
logger = rqm.system.logger;
try{dbconnect.reloadrqm(rqm);}catch(err){console.log(err);}
dbconnect = rqm.system.dbconnect;
MyMongo = dbconnect.MyMongo;
db = new MyMongo('localhost', 27017, 'assassindb');
}

//To read from db
function ReadFromDB()
{	
	db.query('Analytics',function(collection){	
		collection.find().each(function(err,doc){			
				if(err)
				 	logger.write(JSON.stringify(err),'analytics.js');
				else if(doc)
					Analytics[doc.ip] = doc.logs;		
		});	
	});
	/*
			Above Function populates Analytics object as
			Analytics = {
			
					/dots in ip cause an error while insertion into db/
					{ip:192-168-2-97, logs : [{url:'GET/assassinPanel', params:{ RequestList:[{timestamp:1363691315880,browser:'chrome'},{timestamp:1363691316880,browser:'chrome'}] }},
									{url:'GET/index.html', params:{ RequestList:[{timestamp:1363691317880,browser:'chrome'},{timestamp:1363691318880,browser:'chrome'}] }},
										
										and so on..					
								   ]}
					and so on..}
			
			}
	*/
}

function applyFilter(routesObj,request,response)
{
	var
	filterObj = routesObj,
	xfr = request.headers['x-forwarded-for'],	
	ip = xfr?xfr.split(', ')[0]:request.connection.remoteAddress,
	path = request.method + url.parse(request.url).pathname,
	urlReg = null,
	handled = false;
	
	var userAgent = request.headers['user-agent'];
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
	
	logger.write('IP is : '+ip,'analytics.js');
	logger.write('user-agent header is '+userAgent,'analytics.js');
	//logger.write(JSON.stringify(Analytics),'analytics.js');
	
	ip = ip.replace(/\./g,'-');
	
	if(Analytics[ip] != undefined)
	{		
		for(index in Analytics[ip])
		{
			urlReg = new RegExp('^'+Analytics[ip][index].url+'$');
		
			if(urlReg.test(path))
			{
				handled = true;
				
				var LatestRequestOn = new Date().getTime();
				var toPush = {};
				toPush.timestamp = LatestRequestOn;
				toPush.browser = browser;
				Analytics[ip][index].params.RequestList.push(toPush);
			}								
		}
		
		if(!handled)
		{
			//When an ip is accessing a specific url for the first time				
			Analytics[ip].push({url:path,params:{ RequestList : [{timestamp:new Date().getTime(),browser:browser}]}});			
		}
		
		var newObj = {$set:{logs:Analytics[ip]}};
		
		db.query('Analytics',function(collection){					
			collection.update({ip:ip},newObj,{w:1},function(err){
					if(err) logger.write('Error Updating New Path to Analytics : '+err,'analytics.js');
					else logger.write('Updated New Path to Analytics','analytics.js');
			});			
		});
	}
	else
	{
		//When an ip is accessing for the first time
		Analytics[ip] = [];
		var tempObj = {url:path,params:{ RequestList : [{timestamp:new Date().getTime(),browser:browser}] }};
		Analytics[ip].push(tempObj);
		
		var newObj = {ip:ip,logs:[]};
		newObj['logs'].push(tempObj);
		
		db.query('Analytics',function(collection){
			collection.insert(newObj,{w:1},function(err,records){					
					if(err) logger.write('Error while inserting new IP into Analytics : '+err,'analytics.js');
					else logger.write('Inserted new IP into Analytics : '+records,'analytics.js');					
			});
		});
	}
	
	filterObj.filterMessage = 'Allowed: Analytics Filter Applied';
	filterObj.filterStatus = 200;
	return filterObj;
}

//Populate on load, executes only once, when loaded for first time, during server start
//ReadFromDB();

exports.applyFilter = applyFilter;
exports.ReadFromDB = ReadFromDB;
exports.reloadrqm = reloadrqm;
