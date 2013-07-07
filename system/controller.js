/* controller.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that calls the corresponding functions mapped from router.js

*/
var fs = require('fs');
var logger = require('./logger');
var config = require('./config');

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

function reloadrqm(rqm)
{
try{config.reloadrqm(rqm);}catch(err){console.log(err);}
config = rqm.system.config;
try{logger.reloadrqm(rqm);}catch(err){console.log(err);}
logger = rqm.system.logger;
for(var i in extensions)
{
	try{extensions[i].reloadrqm(rqm);}catch(err){console.log(err);}
}
extensions = rqm.controllers;
}

function handleRequest(routesObj,request,response)
{
	//logger.write('routesobj = '+JSON.stringify(routesObj),'controller.js');
	//console.log(JSON.stringify(controllers));
	if(routesObj != undefined || routesObj != null)
	{
		//filterStatus has to be checked instead of filterMessage to know whether to block or allow the request
		if(routesObj['filterStatus']!=undefined && routesObj['filterStatus']!='200')
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
		//to forward to default controller from config
		var defaultController = config.getConfig().defaultController;
		if(defaultController != null || defaultController!='' || defaultController!=undefined)
			controllers[defaultController](request,response);
		else
			controllers.error(request,response);
		//controllers.fileserver(request,response);
		//controllers['proxy'](request,response);
		//controllers.error(request,response);						
	}
}

//The actual controller functions to which requests are forwarded to 
//(and the controller functions may be mapped to extensions)
var controllers = [];
var descriptions = [];
controllers.test = function(request,response)
{
	logger.write('test in controller executed');
	//extensions['respond'].createResponse(response,200,null,'test');
	extensions['fileserver'].serveError(request,response,200,'TEST');
}
descriptions.test = {'title':'Test','info':'A Test Controller'};

controllers.error = function(request,response)
{
	var rHeader = {'Content-Type': 'text/plain'};
	var status = 404;
	var rContent = 'Request Resource Not Found On Server. Please Check the URL';
	//extensions['respond'].createResponse(response,status,rHeader,rContent);
	extensions['fileserver'].serveError(request,response,status,rContent);
}
descriptions.error = {'title':'Echo','info':'Sends a 404 Error'};

controllers.blocked = function(request,response,filterMessage,statusCode)
{
	var rHeader = {'Content-Type': 'text/plain'};
	var status = statusCode;
	var rContent = filterMessage;
	//extensions['respond'].createResponse(response,status,rHeader,rContent);
	extensions['fileserver'].serveError(request,response,status,rContent);
}
descriptions.blocked = {'title':'Blocked','info':'Sends a Blocked Error'};

controllers['assassinPanel'] = extensions['assassinPanel'].invoke;
controllers['fileserver'] = extensions['fileserver'].serveFile;
controllers['echoJSON'] = extensions['echo'].echoQueryJSON;
controllers['echoHTML'] = extensions['echo'].echoQueryHTML;
controllers['echo'] = extensions['echo'].render;

descriptions['assassinPanel'] = {'title':'Assassin Panel','info':'The AssassinPanel Controller'};
descriptions['fileserver'] = {'title':'File Server','info':'The FileServer Controller'};
descriptions['echoJSON'] = {'title':'Echo Query JSON','info':'Returns a JSON object of the QueryString Parameters'};
descriptions['echoHTML'] = {'title':'Echo Query HTML','info':'Returns an HTML page of the QueryString Parameters'};
descriptions['echo'] = {'title':'Echo','info':'Returns an HTML page with Request Details'};

//to separate calls to internal/external proxy based on config
var proxyType = config.getConfig().proxyType;
if(proxyType === 'internal')
{
	controllers['proxy'] = extensions['proxy_internal'].forwardRequest;		
	descriptions['proxy'] = {'title':'Internal Proxy','info':'The Internal Proxy Controller'};
}
else
{
	controllers['proxy'] = extensions['proxy_external'].forwardRequest;				
	descriptions['proxy'] = {'title':'External Proxy','info':'The External Proxy Controller'};
}
	
function getControllers()
{
	return controllers;
}
function getDescriptions()
{
	return descriptions;
}	
exports.handleRequest = handleRequest;
exports.reloadrqm = reloadrqm;
exports.getControllers = getControllers;
exports.getDescriptions = getDescriptions;