/* controller.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that calls the corresponding functions mapped from router.js

*/
var fs = require('fs');
var logger = require('./logger');

var extensions =[];
//Dynamically Reading the controllers folder to get all the extensions
var controllerFiles = [];
controllerFiles = fs.readdirSync('./controllers/');
controllerExtensionReg = new RegExp('.js$');
for(i in controllerFiles)
{
	var controllerFile = controllerFiles[i].split(controllerExtensionReg)[0];
	extensions[controllerFile] = require('../controllers/'+controllerFile);
}

function handleRequest(routesObj,request,response)
{
	logger.write('routesobj = '+JSON.stringify(routesObj),'controller.js');
	if(routesObj != undefined || routesObj != null)
	{
		if(routesObj['filterMessage'] != undefined)
		{
			controllers.blocked(request,response,routesObj['filterMessage'],routesObj['filterStatus']);
		}
		else
		{ 
			var controllerName = routesObj.target;
			if(typeof(controllers[controllerName]) === 'function')
			{
				controllers[controllerName](request,response);		
			}
			else
				controllers.error(request,response);
		}
	}
	else
	{
		//controllers.fileserver(request,response);
		controllers['proxy'](request,response);
		//controllers.error(request,response);
	}
}

//The actual controller functions to which requests are forwarded to 
//(and the controller functions may be mapped to extensions)
var controllers = [];
controllers.test = function(request,response)
{
	logger.write('test in controller executed');
	extensions['respond'].createResponse(response,200,null,'test');
}
controllers.error = function(request,response)
{
	var rHeader = {'Content-Type': 'text/plain'};
	var status = 404;
	var rContent = 'Request Resource Not Found On Server. Please Check the URL';
	extensions['respond'].createResponse(response,status,rHeader,rContent);
}
controllers.blocked = function(request,response,filterMessage,statusCode)
{
	var rHeader = {'Content-Type': 'text/plain'};
	var status = statusCode;
	var rContent = filterMessage;
	extensions['respond'].createResponse(response,status,rHeader,rContent);
}
controllers.testReg = function(request,response)
{
	logger.write('testReg executed');
	extensions['respond'].createResponse(response,200,null,'testReg Executed.');
}
controllers['fileserver'] = extensions['fileserver'].serveFile;
controllers['dnsfunctions'] = extensions['dnsfunctions'].forwardRequest;
controllers['dbfunctions'] = extensions['dbfunctions'].forwardRequest;
controllers['common'] = extensions['common'].forwardRequest;
controllers['users'] = extensions['users'].forwardRequest;
controllers['proxy'] = extensions['proxy'].forwardRequest;
controllers['assassinPanel'] = extensions['assassinPanel'].invoke;

exports.handleRequest = handleRequest;
