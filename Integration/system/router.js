var url = require('url');
var fileserver = require('../fileserver/fileserver');
var controller = require('../controllers/controller');
var $ = require('jquery');
//var api = require('./api');

var config = require('./config');
var logger = require('./logger');

function route(request,response)
{		
	//var result = api.delegate(request,response);
	//consolePrint(request);
	
	var routes = config.getRoutes();
	var reqDetails = url.parse(request.url);
	logger.write("Request Details: "+JSON.stringify(reqDetails));
	var filepath = reqDetails.pathname;
	
	controller.handleRequest(routes[filepath],request,response);
	
	if(routes[filepath] != null)
	{
		logger.write('Route is '+routes[filepath]);
		//Need to handle FunctionServer here
	}
	else
	{
		logger.write('No Route for Request is found');
		//fileserver.handleRequest(request,response);
	}
	
}

exports.route = route
