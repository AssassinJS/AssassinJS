/* controller.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that calls the corresponding functions mapped from router.js

*/
var logger = require('./logger');
var extensions =[];
extensions['dnsfunctions'] = require('../controllers/dnsfunctions');
extensions['dbfunctions'] = require('../controllers/dbfunctions');
extensions['common'] = require('../controllers/common');
extensions['users'] = require('../controllers/users');
extensions['fileserver'] = require('../controllers/fileserver');
extensions['respond'] = require('../controllers/respond');

function handleRequest(routesObj,request,response)
{
	logger.write('routesobj = '+JSON.stringify(routesObj));
	if(routesObj != undefined)
	{
		var controllerName = routesObj[request.method];
		if(typeof(controllers[controllerName]) === 'function')
		{
			controllers[controllerName](request,response);		
		}
		else
			controllers.error(request,response);
	}
	else
	{
		controllers.fileserver(request,response);
	}
	
}

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
	var rContent = 'Requested Resourse is not found on the server. Please Check the URL';
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

exports.handleRequest = handleRequest;
