//This filter implements rate limitation of requests based on IPs and Preset URLs 
//This is the earlier model, works fine, but no support for regex in url checking
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
				else if(doc)
					rateLimits[doc.url] = doc.params;
		
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
				else if(doc)
					IPLogs[doc.ip] = doc;
		
		});	
	});
	/*
			Above Function populates IPLogs object as
			IPLogs = {
			
					/dots in ip cause an error while insertion into db/
					192168297 : {					
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
	xfr = request.headers['x-forwarded-for'],	
	ip = xfr?xfr.split(', ')[0]:request.connection.remoteAddress,
	path = request.method + url.parse(request.url).pathname,
	limitNum = false,
	limitTime = false;
	
	logger.write('IP is : '+ip,'rate-limit.js');
	
	ip = ip.replace(/\./g,'-');
	
	if(rateLimits[path] != undefined)
	{
		limitNum = rateLimits[path]['limitNum'],
		limitTime = rateLimits[path]['limitTime'];//This must be set in milliseconds
		logger.write('path = '+path+', LimitNum = '+limitNum+', LimitTime = '+limitTime,'rate-limit.js');
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
						filterObj.filterMessage = 'Allowed: Request Rate is within Limits';
						filterObj.filterStatus = 200;
					}
					else
					{
						//When limit exceeded
						filterObj.filterMessage = 'Forbidden: Request Rate Exceeded Limits';
						filterObj.filterStatus = 403;
					}
					
					IPLogs[ip][path]['RequestsCounter']++;				
				}
				else
				{
					//When limit window has elapsed and must be reset
					filterObj.filterMessage = 'Allowed: Request Rate is within Limits';
					filterObj.filterStatus = 200;
				
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
			
			logger.write('IP '+ip+' requested path '+path+' '+IPLogs[ip][path]['RequestsCounter']+' times','rate-limit.js');
			logger.write('New IPLogs Obj is  = '+JSON.stringify(newObj),'rate-limit.js');
			
			db.query('IPLogs',function(collection){					
				collection.update({ip:ip},newObj,{w:1},function(err){
						if(err) logger.write('Error Updating New Path to IPlogs : '+err,'rate-limit.js');
						else logger.write('Updated New Path to IPlogs','rate-limit.js');
				});			
			});
		}
		else
		{
			//When an ip is accessing for the first time
			IPLogs[ip] = {};
			IPLogs[ip][path] = { LastRequestOn : new Date().getTime(), RequestsCounter : 1 };
			
			var newObj = {ip:ip};
			newObj[path] = IPLogs[ip][path];
			
			db.query('IPLogs',function(collection){
			
					collection.insert(newObj,{w:1},function(err,records){					
							if(err)
								logger.write('Error while inserting new IP into IPLogs : '+err,'rate-limit.js');
							else
								logger.write('Inserted new IP into IPLogs : '+records,'rate-limit.js');					
					});
			
			});
		}
	}
	
	return filterObj;
}

//Populate on load, executes only once, when loaded for first time, during server start
ReadFromDB();

exports.applyFilter = applyFilter;
