//This filter implements rate limitation of requests based on IPs and Preset URLs 
var logger = require('../system/logger');
var url = require('url');

var dbconnect = require('../system/dbconnect');
var MyMongo = dbconnect.MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

var rateLimits = [];
var IPLogs = {};

function reloadrqm(rqm)
{
logger.reloadrqm(rqm);
logger = rqm.system.logger;
dbconnect.reloadrqm(rqm);
dbconnect = rqm.system.dbconnect;
MyMongo = dbconnect.MyMongo;
db = new MyMongo('localhost', 27017, 'assassindb');
}

//To read from db
function ReadFromDB()
{
	db.query('filterParameters',function(collection){
		collection.find({filter:'rate-limit'},{parameters:1}).nextObject(function(err,doc){				
				if(err)
				 	logger.write(JSON.stringify(err),'rate-limit.js');
				else if(doc)				
					rateLimits = doc.parameters;									
		});
	});
	/*
			Above Function populates rateLimits object as
			rateLimits = [{url:'GET/assassinPanel', params:{ limitNum:10 , limitTime:60000 }},
						  {url:'GET/assassinPanel/index.html', params:{ limitNum:10 , limitTime:60000 }}
			
			  			  and so on..
			
			]
			
			limitTime should be given in ms, changed this from earlier format so as to support regex matching in url fields
	*/
	
	db.query('IPLogs',function(collection){	
		collection.find().each(function(err,doc){			
				if(err)
				 	logger.write(JSON.stringify(err),'rate-limit.js');
				else if(doc)
					IPLogs[doc.ip] = doc.logs;		
		});	
	});
	/*
			Above Function populates IPLogs object as
			IPLogs = {
			
					/dots in ip cause an error while insertion into db/
					192-168-2-97 : [{url:'GET/assassinPanel', params:{ LastRequestOn:1363691315880 , RequestsCounter:7 }},
									{url:'GET/index.html', params:{ LastRequestOn:1363643127965 , RequestsCounter:5 }},
										
										and so on..					
								   }],
					and so on..
			
			}
			
			LastRequestOn should be given in ms, changed this from earlier format so as to support regex matching in url fields
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
	limitTime = false,
	urlReg = null,
	urlReg2 = null,
	handled = false;
		
	logger.write('IP is : '+ip,'rate-limit.js');
	
	logger.write(JSON.stringify(rateLimits),'rate-limit.js');
	logger.write(JSON.stringify(IPLogs),'rate-limit.js');
	
	ip = ip.replace(/\./g,'-');
	
	for(index in rateLimits)
	{
		//urlReg = new RegExp('^'+rateLimits[index].url+'$');
		
		//removed ^,$ -> matches even without them
		urlReg = new RegExp(rateLimits[index].url);
	
		if(urlReg.test(path))
		{
			limitNum = parseInt(rateLimits[index].params.limitNum);
			limitTime = parseInt(rateLimits[index].params.limitTime);
			logger.write('path = '+path+', LimitNum = '+limitNum+', LimitTime = '+limitTime,'rate-limit.js');
			urlReg = rateLimits[index].url;
			logger.write('URL RegExp = '+JSON.stringify(urlReg),'rate-limit');
			break;
		}
	}
	
	if(limitNum && limitTime)
	{		
		if(IPLogs[ip] != undefined)
		{		
			for(index in IPLogs[ip])
			{
				//urlReg2 = new RegExp('^'+IPLogs[ip][index].url+'$');
				
				//removed ^,$ -> matches even without them		
				urlReg2 = new RegExp(IPLogs[ip][index].url);	
			
				if(urlReg2.test(path))
				{
					handled = true;
					
					var
					LastRequestOn = IPLogs[ip][index].params.LastRequestOn,
					RequestsCounter = IPLogs[ip][index].params.RequestsCounter,
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
							filterObj.filterMessage = 'Forbidden: Request Rate Exceeded Limits. '+LastRequestOn+'+'+limitTime+'='+(LastRequestOn + limitTime)+'   '+LatestRequestOn;
							filterObj.filterStatus = 403;
						}
					
						IPLogs[ip][index].params.RequestsCounter++;				
					}
					else
					{
						//When limit window has elapsed and must be reset
						filterObj.filterMessage = 'Allowed: Request Rate is within Limits';
						filterObj.filterStatus = 200;
				
						IPLogs[ip][index].params.LastRequestOn = LatestRequestOn;
						IPLogs[ip][index].params.RequestsCounter = 1;
					}
					
					break;
				}								
			}
			
			if(!handled)
			{
				//When an ip is accessing a specific url for the first time				
				IPLogs[ip].push({url:urlReg,params:{ LastRequestOn : new Date().getTime() , RequestsCounter : 1 }});
				
				filterObj.filterMessage = 'Allowed: Request Rate is within Limits';
				filterObj.filterStatus = 200;				
			}
			
			var newObj = {$set:{logs:IPLogs[ip]}};
			
			logger.write('IP '+ip+' requested path '+path+' '+IPLogs[ip][index].params.RequestsCounter+' times','rate-limit.js');
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
			IPLogs[ip] = [];
			var tempObj = {url:urlReg,params:{ LastRequestOn : new Date().getTime(), RequestsCounter : 1 }};
			IPLogs[ip].push(tempObj);
			
			var newObj = {ip:ip,logs:[]};
			newObj['logs'].push(tempObj);
			
			filterObj.filterMessage = 'Allowed: Request Rate is within Limits';
			filterObj.filterStatus = 200;
			
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
//ReadFromDB();

exports.applyFilter = applyFilter;
exports.ReadFromDB = ReadFromDB;
exports.reloadrqm = reloadrqm;