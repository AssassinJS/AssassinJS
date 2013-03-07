var common = require('./common');
var url = require('url');
var queryutil = require('querystring');
var crypto = require('crypto');

function forwardRequest(request,response)
{
	this.generateUID = function(request,response)
	{
		var params = url.parse(request.url).query;	
		console.log('query is '+params);		
		var userObj = queryutil.parse(params);
		var result = crypto.createHash('md5').update(userObj.email+new Date()).digest('hex');
		
		console.log(result);		
		response.writeHead(200,{'content-type':'text/plain'});			
		response.write(result);				 
		response.end();
	}

	//actual calling part
	var pathname = url.parse(request.url).pathname;	
	console.log(pathname);
	console.log(this);
	var word = pathname.split('/')[2];
			
	if(typeof(this[word]) === 'function')
	{
		this[word](request,response);		
	}
	else
	{
		common.errorEcho(request,response);
	}
}

exports.forwardRequest = forwardRequest;
