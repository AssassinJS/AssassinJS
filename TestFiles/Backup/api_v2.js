var url = require('url');
var dns = require('dns');

function delegate(request,response)
{	
	//different methods of the api
	this.errorEcho = function(request,response)
	{
		response.writeHead(200,{'content-type':'text/plain'});
		var result = 'HTTP - '+request.httpVersion+'\nMethod - '+request.method+'\nURL - '+request.url+'\nHeader - '+request.header;	
		var extra = 'Error - Method does not exist';	
		response.write(result+'\n'+extra);		
		response.end();
		
		return;
	};	
	
	this.defaultEcho = function(request,response)
	{
		response.writeHead(200,{'content-type':'text/plain'});	
		var result = 'HTTP - '+request.httpVersion+'\nMethod - '+request.method+'\nURL - '+request.url+'\nHeader - '+request.header;
		response.write(result);		
		response.end();	
		
		return;
	};
	
	this.findip = function(request,response)
	{	
		var param1 = url.parse(request.url).query.split('=')[1];	
		console.log('query = '+param1);		
						
		dns.lookup(param1,function(err,ip){
				
			var result = 'HTTP - '+request.httpVersion+'\nMethod - '+request.method+'\nURL - '+request.url+'\nHeader - '+request.header;		
	
			if(err) 
			{			 
				 result += '\n'+'Encountered Error - '+err;
			}
			else
			{				
				 result += '\n'+param1+' resolved to '+ip;	
			}
		
		 	console.log(result);		
			response.writeHead(200,{'content-type':'text/plain'});			
			response.write(result);				 
			response.end();		
			 		
		});	
		
		return;		
	};
	
	//actual calling part
	var pathname = url.parse(request.url).pathname;	
	console.log(pathname);
	console.log(this);
	var word = pathname.split('/')[1];
			
	if(typeof(this[word]) === 'function')
	{
		this[word](request,response);
	}
	else
	{
		this.errorEcho(request,response);
	}
	
}

exports.delegate = delegate

