var url = require('url');

var controllers = [];
controllers['dnsfunctions'] = require('./controllers/dnsfunctions');
controllers['dbfunctions'] = require('./controllers/dbfunctions');
controllers['common'] = require('./controllers/common');
controllers['users'] = require('./controllers/users');

function delegate(request,response)
{				
	//actual calling part
	var pathname = url.parse(request.url).pathname;	
	console.log(pathname);
	console.log(this);
	var word = pathname.split('/')[1];
	
	if(typeof(controllers[word]) !== 'undefined')
	{
		controllers[word].forwardRequest(request,response);
	}
	else
	{
		controllers.common.errorEcho(request,response);
	}
	
}

exports.delegate = delegate

