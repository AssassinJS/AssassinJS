/* assassinPanel.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is a default controller that invokes the assassinPanel UI

*/

var fileserver = require('./fileserver');
var logger = require('../system/logger');

var MyMongo = require('../system/dbconnect.js').MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');
 
var DataObj = {};

getDBParameterObjects();//ensures first time execution
function getDBParameterObjects()
{
	db.query('filterParameters',function(collection){		
				
		DataObj['filterDB'] = {};
		collection.find({}).each(function(err,item){
			if(err) 
				logger.write('error occured in retrieving from db','assassinPanel filterDB');
			else if(item)
			{
				DataObj['filterDB'][item.filter] = item.parameters;
				
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

function invoke(req,res)
{
	//First need to check of user validation credentials.
	//If valid user, then show home page
	//else redirect to login index page
	DataObj['request'] = req;
	DataObj['response'] = res;
	fileserver.serveFile(req,res,null,DataObj);
}

exports.invoke = invoke;
