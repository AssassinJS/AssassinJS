/* assassinPanel.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is a default controller that invokes the assassinPanel UI

*/

var fileserver = require('./fileserver');
var logger = require('../system/logger');
var url = require('url');

var MyMongo = require('../system/dbconnect.js').MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');
 
var DataObj = { Session: {} };

getDBParameterObjects();//ensures first time execution
function getDBParameterObjects()
{
	db.query('filterParameters',function(collection){		
				
		DataObj['filterDB'] = {};
		DataObj['filterDB']['format'] = {};
		DataObj['filterDB']['total'] = {};
		collection.find({}).each(function(err,item){
			if(err) 
				logger.write('error occured in retrieving from db','assassinPanel filterDB');
			else if(item)
			{
				DataObj['filterDB'][item.filter] = item.parameters;
				
				DataObj['filterDB']['format'][item.filter] = item.paramsformat;
				
				if(item.total!=undefined)
					DataObj['filterDB']['total'][item.filter] = item.total;
				
				//logger.write(JSON.stringify(DataObj['filterDB']),'assassinPanel filterDB');
			}
		});
		
	});
	db.query('routes',function(collection){		
				
		DataObj['routesDB'] = {};
		collection.find({}).toArray(function(err,items){
			if(err) ;
			else if(items)
			{
				DataObj['routesDB'] = items;
				
				//logger.write(JSON.stringify(DataObj['routesDB']),'assassinPanel routesDB');
			}
		});
		
	});
}

function forward(req,res)
{
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
	
	if(endpoint[endpoint.length-1] === 'login.jssp' && req.body)
	{
		logger.write('Request Body is = '+JSON.stringify(req.body),'assassinPanel.js');
		var source = req.body;		
		var splitTokens = source.split('&');
		var uname = splitTokens[0].split('=')[1];
		var secret = splitTokens[1].split('=')[1];		
				
		//checking auth credentials from db
		//the db object model is simple and easy
		//{ "_id":"adasdas112312aqsda" , "filter":"login" , "parameters":{ "admin":"password" } }
		db.query('filterParameters',function(collection){		
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
				req.url = req['url'].replace(/login\.jssp/,'home.jssp');
				
				//forwarding request
				forward(req,res);
				
			});		
		});			
	}
	else if(endpoint[endpoint.length-1] === 'logout.jssp')
	{
		//removing stored session from memory
		delete DataObj.Session[ip];
		
		//redirecting to index page
		req.url = req['url'].replace(/logout\.jssp/,'index.jssp');
		
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
