/* router.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that maps the request URL's to those in the routes.txt file

*/

var url = require('url');
var fs = require('fs');

var rqm = require('./rqmodules');

var controller = rqm.system.controller;
var logger = rqm.system.logger;
var filter = rqm.system.filter;

var MyMongo = rqm.system.dbconnect.MyMongo;
var db = new MyMongo('localhost', 27017, 'assassindb');

//Reading Routes File
var routes={};

//Reading Routes from DB
//ReadFromDB(); //Ensures first time execution
function ReadFromDB()
{
	db.query('routes',function(collection){			
		collection.find().toArray(function(err,list){
			routes = list;
		});		
	});
}

function process(request,response)
{
	logger.write('Request Headers are '+JSON.stringify(request.headers),'router.js');
	var reqDetails = url.parse(request.url);
	logger.write("Request Details: "+JSON.stringify(reqDetails));
	var filepath = request.method+reqDetails.pathname;
	var isHandled = false;
	for(i in routes)
	{
		//DO NOT REMOVE ^ and $, they are very very important
		var urlReg = new RegExp('^'+routes[i].regexp+'$');
		//DO NOT REMOVE ^ and $, they are very very important
		
		//removed ^,$ -> matches even without them
		//var urlReg = new RegExp(routes[i].regexp);
		
		if(urlReg.test(filepath))
		{
			isHandled = true;
						
			if(routes[i].filters !=null || routes[i].filters != undefined)
			{
				logger.write('Trying to apply filters..','router.js');
				filter.applyFilters(routes[i],request,response);
			}
			else
			{
				logger.write('No filters defined for route..','router.js');
				controller.handleRequest(routes[i],request,response);
			}
			
			//To stop iteration after correct route is found and executed
			break;
		}
	}
			
	if(!isHandled)
	{
		logger.write('URL not found');
		controller.handleRequest(null,request,response);
	}        	    

}

//Actual Routing Function
function route(request,response)
{			
	request.rqm = rqm;
	if(request.method == 'POST')//for post requests, to get the entire request body
	{
        var reqbody = '';
        request.on('data', function (data) {
            reqbody += data;
        });
        request.on('end', function () {
			request.body = reqbody;
			logger.write(request.body,'router.js');
		
			process(request,response);
        });
    }
    else//for get requests
    {
		process(request,response);
	}
}

exports.route = route;
exports.ReadFromDB = ReadFromDB;
