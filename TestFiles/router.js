var url = require('url');
var api = require('./api');

function route(request,response)
{		
	var result = api.delegate(request,response);
	consolePrint(request);
}

function consolePrint(request)
{				
	var uriObj = url.parse(request.url);

	console.log('\n==============================');
	console.log('Router Received Request for '+uriObj.pathname);
	console.log('HTTP - '+request.httpVersion);
	console.log('Method - '+request.method);
	console.log('URL - '+request.url);
	console.log('Header - '+request.header);
	console.log('==============================\n');
}

exports.route = route
