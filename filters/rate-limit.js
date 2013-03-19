//This filter implements rate limitation of requests based on IPs and Preset URLs 
var logger = require('../system/logger');
var fs = require('fs');
var url = require('url');

var MyMongo = require('../system/dbconnect.js').MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

var rateLimits = {};
var IPLogs = {};

//To read from db
function ReadFromDB()
{
	db.query('rateLimits',function(collection){	
		collection.find().each(function(err,doc){
			
				if(err)
				 	logger.write();
				else
					rateLimits[doc.url] = doc;
		
		});		
	});
	/*
			Above Function populates rateLimits object as
			rateLimits = {
			
					GET/assassinPanel : { limitNum:10 , limitTime:60000 },
					GET/index.html : { limitNum:20 , limitTime:60000 },
					
					and so on..
			
			}
			
			limitTime should be given in ms
	*/
	
	db.query('IPLogs',function(collection){	
		collection.find().each(function(err,doc){
			
				if(err)
				 	logger.write();
				else
					IPLogs[doc.ip] = doc;
		
		});	
	});
	/*
			Above Function populates IPLogs object as
			IPLogs = {
			
					192.168.2.97 : {					
										GET/assassinPanel : { LastRequestOn:1363691315880 , RequestsCounter:7 },
										GET/index.html : { LastRequestOn:1363643127965 , RequestsCounter:5 },
										
										and so on..					
								   },
					and so on..
			
			}
	*/
}

function applyFilter(routesObj,request,response)
{
	var
	filterObj = routesObj,
	ip = request.headers['x-forwarded-for'].split(', ')[0] || request.connection.remoteAddress,
	path = request.method + url.parse(request.url).pathname,
	limitNum = false,
	limitTime = false;
	
	logger.write('IP is : '+ip,'rate-limit.js');
	
	if(rateLimits[path] != undefined)
	{
		limitNum = rateLimits[path]['limitNum'],
		limitTime = rateLimits[path]['limitTime'];//This must be set in milliseconds
	}
	
	if(limitNum && limitTime)
	{
		if(IPLogs[ip] != undefined)
		{
			if(IPLogs[ip][path] != undefined)
			{
				var
				LastRequestOn = IPLogs[ip][path]['LastRequestOn'],
				RequestsCounter = IPLogs[ip][path]['RequestsCounter'],
				LatestRequestOn = new Date().getTime();
				
				if(LastRequestOn + limitTime > LatestRequestOn)
				{
					if(RequestsCounter < limitNum)
					{
						//When within limit
						filterobj.filterMessage = 'Allowed: Request Rate is within Limits';
						filterobj.filterStatus = 200;
					}
					else
					{
						//When limit exceeded
						filterobj.filterMessage = 'Forbidden: Request Rate Exceeded Limits';
						filterobj.filterStatus = 403;
					}
					
					IPLogs[ip][path]['RequestsCounter']++;
				}
				else
				{
					//When limit window has elapsed and must be reset
					filterobj.filterMessage = 'Allowed: Request Rate is within Limits';
					filterobj.filterStatus = 200;
				
					IPLogs[ip][path]['LastRequestOn'] = LatestRequestOn;
					IPLogs[ip][path]['RequestsCounter'] = 1;
				}
				
			
			}
			else
			{
				//When an ip is accessing a specific url for the first time
				IPLogs[ip][path] = { LastRequestOn : new Date().getTime() , RequestsCounter : 1 };				
			}
			
			var newObj = {$set:{}};
			newObj['$set'][path] = IPLogs[ip][path];
			
			db.query('IPLogs',function(collection){
					
				collection.update({ip:ip},newObj,{w:1},function(err){
						if(err) Logger.write('Error Updating New Path to IPlogs : '+err,'rate-limit.js');
						else Logger.write('Updated New Path to IPlogs','rate-limit.js');
				});
			
			});
		}
		else
		{
			//When an ip is accessing for the first time
			IPLogs[ip] = {};
			IPLogs[ip][path] = { LastRequestOn : new Date().getTime(), RequestsCounter : 1 };
			
			db.query('IPLogs',function(collection){
			
					collection.insert(IPLogs[ip],{w:1},function(err,records){
					
							if(err)
								logger.write('Error while inserting new IP into IPLogs : '+err,'rate-limit.js');
							else
								logger.write('Inserted new IP into IPLogs : '+records,'rate-limit.js');
					
					});
			
			});
		}
	}
}

//Populate on load, executes only once, when loaded for first time, during server start
ReadFromDB();

exports.applyFilter = applyFilter;
