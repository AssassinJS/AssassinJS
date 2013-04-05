function errorEcho(request,response)
{
		response.writeHead(200,{'content-type':'text/plain'});
		var result = 'HTTP - '+request.httpVersion+'\nMethod - '+request.method+'\nURL - '+request.url+'\nHeader - '+request.header;	
		var extra = 'Error - Method does not exist';	
		response.write(result+'\n'+extra);		
		response.end();
		
		return;
}

function defaultEcho(request,response)
{
		response.writeHead(200,{'content-type':'text/plain'});	
		var result = 'HTTP - '+request.httpVersion+'\nMethod - '+request.method+'\nURL - '+request.url+'\nHeader - '+request.header;
		response.write(result);		
		response.end();	
		
		return;
}

exports.errorEcho = errorEcho;
exports.defaultEcho = defaultEcho;
