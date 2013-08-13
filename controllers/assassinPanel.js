/* assassinPanel.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is a default controller that invokes the assassinPanel UI

*/

var fileserver = require('./fileserver');
var logger = require('../system/logger');
var url = require('url');

var dbconnect = require('../system/dbconnect');
var MyMongo = dbconnect.MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

var DataObj = { Session: {} };
DataObj['filterDB'] = {};
DataObj['filterDB']['format'] = {};
DataObj['filterDB']['formattype'] = {};
DataObj['filterDB']['total'] = {};
DataObj['routesDB'] = {}; 

function reloadrqm(rqm)
{
try{logger.reloadrqm(rqm);}catch(err){console.log(err);}
logger = rqm.system.logger;
try{dbconnect.reloadrqm(rqm);}catch(err){console.log(err);}
dbconnect = rqm.system.dbconnect;
MyMongo = dbconnect.MyMongo;
db = new MyMongo('localhost', 27017, 'assassindb');
try{fileserver.reloadrqm(rqm);}catch(err){console.log(err);}
fileserver = rqm.controllers.fileserver;
}

//this function is called in index.js
//getDBParameterObjects();//ensures first time execution
function getDBParameterObjects()
{
	if(db.useDB == 'true')
	{
		db.query('filterParameters',function(collection){		
					

			collection.find({}).each(function(err,item){
				if(err) 
					logger.write('error occured in retrieving from db','assassinPanel filterDB');
				else if(item)
				{
					//console.log(item.filter);
					DataObj['filterDB'][item.filter] = item.parameters;
					
					if(item.paramsformat!=undefined)
					DataObj['filterDB']['format'][item.filter] = item.paramsformat;
					
					if(item.paramsformattype!=undefined)
					DataObj['filterDB']['formattype'][item.filter] = item.paramsformattype;
					
					if(item.total!=undefined)
						DataObj['filterDB']['total'][item.filter] = item.total;
					
					//logger.write(JSON.stringify(DataObj['filterDB']),'assassinPanel filterDB');
				}
			});
			
		});
		db.query('routes',function(collection){		
					
			collection.find({}).toArray(function(err,items){
				if(err) ;
				else if(items)
				{
					DataObj['routesDB'] = items; 
					
					//logger.write(JSON.stringify(DataObj['routesDB']),'assassinPanel routesDB');
					//console.log(JSON.stringify(items));
					//console.log("one  "+JSON.stringify(DataObj['routesDB']));
				}
			});
			
		});
		db.query('Analytics',function(collection){
			collection.find({}).toArray(function(err,items){
				if(err) ;
				else if(items)
				{
					DataObj['analyticsDB'] = items;
				}
			});
		});
	}
	else if(db.useDB == 'false')
	{
		DataObj['routesDB']=require('../config/routes.json');
		DataObj['routesDB'] = DataObj['routesDB'].concat(require('../config/assassinPanel.json').routes);
	}
	//console.log(db.useDB);
}

function forward(req,res)
{
	//console.log("forwarding to fileserver "+JSON.stringify(DataObj));
	DataObj['request'] = req;
	DataObj['response'] = res;	
	fileserver.serveFile(req,res,null,DataObj);
}

function invoke(req,res)
{
	//First need to check user validation credentials.
	//If valid user, then show home page
	//else redirect to login index page		
	var
	req_url = url.parse(req.url),
	endpoint = req_url.pathname.split('/'),
	xfr = req.headers['x-forwarded-for'],	
	ip = xfr?xfr.split(', ')[0]:req.connection.remoteAddress;
	
	ip = ip.replace(/\./g,'-');
	
	if(endpoint[endpoint.length-1] === 'login' && req.body)
	{
		logger.write('Request Body is = '+JSON.stringify(req.body),'assassinPanel.js');
		var source = req.body;		
		var splitTokens = source.split('&');
		var uname = splitTokens[0].split('=')[1];
		var secret = splitTokens[1].split('=')[1];		
				
		//checking auth credentials from db
		//the db object model is simple and easy
		//{ "_id":"adasdas112312aqsda" , "filter":"login" , "parameters":{ "admin":"password" } }
		db.query('filterParameters',function(collection,status){
			collection.find({filter:'login'}).nextObject(function(err,doc){			
				if(doc)
				{								
					if(doc.parameters[uname] === secret)	
						DataObj.Session[ip] = { loginOn:new Date().getTime() , isActive:true };							
				}
				else if(err)
				{
					logger.write('Error while validating login: '+JSON.stringify(err),'assassinPanel.js');
				}
												
				//redirecting to home page
				req.url = req['url'].replace(/login/,'home.jssp');
				
				//forwarding request
				forward(req,res);	
			});
		});
		if(db.useDB == 'false')
		{
			var aPconfig = require('../config/assassinPanel.json');
			if(uname == aPconfig.uname && secret == aPconfig.secret)
			{
				DataObj.Session[ip] = { loginOn:new Date().getTime() , isActive:true };
			}
			//redirecting to home page
			req.url = req['url'].replace(/login/,'home.jssp');
				
			//forwarding request
			forward(req,res);
		}
	}
	else if(endpoint[endpoint.length-1] === 'logout')
	{
		//removing stored session from memory
		delete DataObj.Session[ip];
		
		//redirecting to index page
		req.url = req['url'].replace(/logout/,'index.jssp');
		
		//forwarding request
		forward(req,res);
	}
	else if(endpoint[endpoint.length-1] === 'index.jssp' && (ip in DataObj.Session))
	{
		//When already logged in and trying to access index page
		//redirecting to home page
		req.url = req['url'].replace(/index\.jssp/,'home.jssp');
		
		//forwarding request
		forward(req,res);
	
	}
	else
	{
		forward(req,res);
	}
}

exports.invoke = invoke;
exports.getDBParameterObjects = getDBParameterObjects;
exports.reloadrqm = reloadrqm;
