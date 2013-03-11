var common = require('./common');
var url = require('url');
var http = require('http');
var config = require('../system/config');

function forwardRequest(request,response)
{	
	var		
	domain = config.getConfig().domain,
	domainPort = config.getConfig().domainPort,
	pathstring = request.url;
	
	//cached request,response objects
	var cached_request = request;
	var cached_response = response;
	
	this.requestComplete = function(res)
	{
		console.log('STATUS: ' + res.statusCode);
 		console.log('HEADERS: ' + JSON.stringify(res.headers));
  		//res.setEncoding('utf8');
  		//res.setEncoding('binary');
  		
  		cached_response.writeHead(res.statusCode,res.headers);
  		
 		res.on('data', function (chunk) { 			
    		console.log('BODY: ' + chunk);
    		cached_response.write(chunk);	     	 
  		});
  		
  		res.on('end',function() {  			  			  			    		
    		cached_response.addTrailers(res.headers);
    		cached_response.end(); 	
  		});
	};
	
	this.makePOSTrequest = function(original_request,original_post_data)
	{
		//var data = JSON.stringify(original_post_data);
		
		var options = {
 						 host: domain,
 						 port: domainPort,
  						 path: pathstring,
  						 headers: original_request.headers,
  						 method: 'POST'
					  };
					  
		var new_request = http.request(options, this.requestComplete)
		.on('error', function(e) {
  			console.log('problem with request: ' + e.message);
  			response.writeHead(500,{'Content-Type': 'text/plain'});
    		response.write('Invalid URL Specified');
    		response.end();
		});
		
		new_request.write(original_post_data);
		new_request.end();

	};
	
	if(request.method == 'GET')
	{					
		console.log(domain+pathstring);
		
		var options = {
  						host: domain,
 						port: domainPort,
  						path: pathstring,
  						headers: request.headers
					  };

		http.get(options, this.requestComplete)
		.on('error', function(e) {
  			console.log('problem with request: ' + e.message);
  			response.writeHead(500,{'Content-Type': 'text/plain'});
    		response.write('Invalid URL Specified');
    		response.end();
		});
	}
	else if(request.method == 'POST')
	{
		//caching Post Content Chunks
		var fullPostData = '';
		
		request.on('data', function(chunk) {		
      		// append the current chunk of data to the content cache
     		fullPostData += chunk;
   		});
   		
   		request.on('end',function() {  			  			  			    		
    		this.makePOSTrequest(cached_request,fullPostData);
  		});
	}
	else if(request.method == 'PUT')
	{
	
	}
	else if(request.method == 'DELETE')
	{
	
	}	
	
}

exports.forwardRequest = forwardRequest;
