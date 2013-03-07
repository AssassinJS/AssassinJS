var common = require('./common');
var url = require('url');
var http = require('http');

function forwardRequest(request,response)
{		
	//For returning response to browser
	var final_response = '';

	this.requestComplete = function(res)
	{
		console.log('STATUS: ' + res.statusCode);
 		console.log('HEADERS: ' + JSON.stringify(res.headers));
  		//res.setEncoding('utf8');
  		
  		final_response.writeHead(res.statusCode,res.headers);
  		
 		res.on('data', function (chunk) { 			
    		console.log('BODY: ' + chunk);
    		final_response.write(chunk);	     	 
  		});
  		
  		res.on('end',function() {  			  			  			
    		
    		final_response.addTrailers(res.headers);
    		final_response.end(); 	
  		});
	};
	
	this.getURL = function(request,response)
	{
		final_response = response;
		
		var
		query = url.parse(request.url).query.replace(/query=/,''),
		domain = query.split('/')[0],
		pathstring = '/'+query.slice(domain.length+1);
							
		console.log(domain+pathstring);
		
		var options = {
  						host: domain,
 						port: 80,
  						path: pathstring
					  };

		http.get(options, this.requestComplete)
		.on('error', function(e) {
  			console.log('problem with request: ' + e.message);
  			final_response.writeHead(500,{'Content-Type': 'text/plain'});
    		final_response.write('Invalid URL Specified');
    		final_response.end();
		});

	};
	
	this.postURL = function(request,response)
	{
		
	};
		
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
		//common.errorEcho(request,response);
		
		final_response = response;
						
		var	domain='www.veooz.com';
		var	pathstring = request.url;
			
		console.log(domain+pathstring);
		
		var options = {
  						host: domain,
 						port: 80,
  						path: pathstring
					  };

		http.get(options, this.requestComplete)
		.on('error', function(e) {
  			console.log('problem with request: ' + e.message);
  			final_response.writeHead(500,{'Content-Type': 'text/plain'});
    		final_response.write('Invalid URL Specified');
    		final_response.end();
		});
		
	}
}

exports.forwardRequest = forwardRequest;
