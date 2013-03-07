/* controller.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that calls the corresponding functions mapped from router.js

*/
var logger = require('../system/logger');
var extensions =[];
extensions['dnsfunctions'] = require('./extensions/dnsfunctions');
extensions['dbfunctions'] = require('./extensions/dbfunctions');
extensions['common'] = require('./extensions/common');
extensions['users'] = require('./extensions/users');
extensions['fileserver'] = require('./extensions/fileserver/fileserver');
extensions['error'] = require('./extensions/error');

function handleRequest(routesObj,request,response)
{				
	
	var controllerName = routesObj[request.method];
	logger.write('routesobj = '+JSON.stringify(routesObj));
	if(typeof(controllers[controllerName]) === 'function')
	{
		controllers[controllerName](request,response);		
	}
	else
	{
		controllers.error(request,response);
	}
	
}

var controllers = [];
controllers.test = function(request,response)
{
	logger.write('test in controller executed');
}
controllers['fileserver'] = extensions['fileserver'].serveFile;
controllers['dnsfunctions'] = extensions['dnsfunctions'].forwardRequest;
controllers['dbfunctions'] = extensions['dbfunctions'].forwardRequest;
controllers['common'] = extensions['common'].forwardRequest;
controllers['users'] = extensions['users'].forwardRequest;
controllers['error'] = extensions['error'].errorResponse;


exports.handleRequest = handleRequest;

