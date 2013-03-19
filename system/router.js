/* router.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that maps the request URL's to those in the routes.txt file

*/

var url = require('url');
var fs = require('fs');
var controller = require('./controller');
var logger = require('./logger');
var filter = require('./filter');

var MyMongo = require('./dbconnect.js').MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

//Reading Routes File
var routes = [];

//Reading Routes from DB
ReadFromDB(); //Ensures first time execution
function ReadFromDB()
{
	db.query('routes',function(collection){
			
		collection.find().toArray(function(err,list){
			routes = list;
		});
		
	});
}

//Actual Routing Function
function route(request,response)
{			
	logger.write('Routes = '+JSON.stringify(routes),'router.js');
	logger.write('Request Headers are '+JSON.stringify(request.headers),'router.js');
	var reqDetails = url.parse(request.url);
	logger.write("Request Details: "+JSON.stringify(reqDetails));
	var filepath = reqDetails.pathname;
	var isHandled = false;
	for(i in routes)
	{
		var urlReg = new RegExp('^'+routes[i].regexp+'$');
		if(urlReg.test(filepath))
		{
			isHandled = true;
			
			if(routes[i].filters != undefined)
			{
				logger.write('Route is'+JSON.stringify(routes[i]),'router.js');
				filter.applyFilters(routes[i],request,response);
			}
			else
				controller.handleRequest(routes[i],request,response);
		}
	}
	if(!isHandled)
	{
		logger.write('URL not found');
		controller.handleRequest(null,request,response);
	}
}

exports.route = route;
exports.ReadFromDB = ReadFromDB;
