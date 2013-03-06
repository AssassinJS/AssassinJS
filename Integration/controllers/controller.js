
var logger = require('../system/logger');
var extensions =[];
extensions['dnsfunctions'] = require('./extensions/dnsfunctions');
extensions['dbfunctions'] = require('./extensions/dbfunctions');
extensions['common'] = require('./extensions/common');
extensions['users'] = require('./extensions/users');

function handleRequest(routesObj,request,response)
{				
	
	var controllerName = routesObj.target;
	logger.write('routesobj = '+JSON.stringify(routesObj));
	if(typeof(controllers[controllerName]) === 'function')
	{
		controllers[controllerName](request,response);		
	}
	else
	{
		logger.write('endpoint function '+controllerName+' not defined');
	}
	
}

var controllers = [];
controllers.test = function(request,response)
{
	logger.write('test in controller executed');
}
controllers.fileserve = function(request,response)
{
	
}
controllers['dnsfunctions'] = extensions['dnsfunctions'].forwardRequest;
controllers['dbfunctions'] = extensions['dbfunctions'].forwardRequest;
controllers['common'] = extensions['common'].forwardRequest;
controllers['users'] = extensions['users'].forwardRequest;


exports.handleRequest = handleRequest;

