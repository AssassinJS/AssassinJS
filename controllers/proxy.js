var common = require('./common');
var url = require('url');
var http = require('http');
var config = require('../system/config');
var logger = require('../system/logger');

function forwardRequest(request,response)
{	
	var		
	domain = config.getConfig().domain,
	domainPort = config.getConfig().domainPort,
	pathstring = request.url;
	
	//cached request,response objects
	var cached_request = request;
	var cached_response = response;		
	
	//called on getting response from target server
	var requestComplete = function(res)
	{
		logger.write('STATUS: ' + res.statusCode,'proxy.js');
 		logger.write('HEADERS: ' + JSON.stringify(res.headers),'proxy.js');
  		//res.setEncoding('utf8');
  		//res.setEncoding('binary');
  		
  		cached_response.writeHead(res.statusCode,res.headers);
  		
 		res.on('data', function (chunk) { 			
    		logger.write('BODY: ' + chunk,'proxy.js');
    		cached_response.write(chunk);	     	 
  		});
  		
  		res.on('end',function() {  			  			  			    		
    		cached_response.addTrailers(res.headers);
    		cached_response.end(); 	
  		});
	};
			
	//for making a http head request
	var makeHEADrequest = function(request)
	{
		var options = {
  						host: domain,
 						port: domainPort,
  						path: pathstring,
  						headers: request.headers,
  						method: 'HEAD'
					  };

		var new_request = http.request(options,function(res){
						
		logger.write('STATUS: ' + res.statusCode,'proxy.js');
 		logger.write('HEADERS: ' + JSON.stringify(res.headers),'proxy.js');
  		
  		cached_response.writeHead(res.statusCode,res.headers);
  		cached_response.end(); 	
  											
		});
		
		new_request.on('error', function(e) {
  			logger.write('problem with request: ' + e.message,'proxy.js');
  			cached_response.writeHead(500,{'Content-Type': 'text/plain'});
    		cached_response.write('Invalid URL Specified');
    		cached_response.end();
		});
		
		new_request.end();	
		
		return;
	};
	
	//for making a http get request
	var makeGETrequest = function(request)
	{
		var options = {
  						host: domain,
 						port: domainPort,
  						path: pathstring,
  						headers: request.headers
					  };

		http.get(options, requestComplete)
		.on('error', function(e) {
  			logger.write('problem with request: ' + e.message,'proxy.js');
  			cached_response.writeHead(500,{'Content-Type': 'text/plain'});
    		cached_response.write('Invalid URL Specified');
    		cached_response.end();
		});
		
		return;
	};
	
	//for making other http requests
	var makeRequest = function(data)
	{
		var options = {
 						host: domain,
 						port: domainPort,
  						path: pathstring,
  						headers: cached_request.headers,
  						method: cached_request.method
					 };
					  
		var new_request = http.request(options, requestComplete)
		.on('error', function(e) {
  			logger.write('problem with request: ' + e.message,'proxy.js');
  			cached_response.writeHead(500,{'Content-Type': 'text/plain'});
    		cached_response.write('Invalid URL Specified');
    		cached_response.end();
		});
			
		new_request.write(data);			
		new_request.end();
	};
			
	//for receiving request from source
	var receiveRequest = function(request)
	{			
		//caching Post Content Chunks
		var fullData = '';
		
		request.on('data', function(chunk) {		
      		// append the current chunk of data to the content cache
     		fullData += chunk;
   		});
   		
   		request.on('end',function() {   		
   			makeRequest(fullData);
  		});
	};
	
	//actual execution part starts from here
	logger.write('Call To '+domain+pathstring,'proxy.js');
	
	switch(request.method)
	{
		case 'HEAD':		
						makeHEADrequest(request);						
						return;			 									 				 		
		case 'GET':							
						makeGETrequest(request);
						return;						
		case 'POST':
		case 'PUT':
		case 'PATCH':
		case 'DELETE':
		case 'OPTIONS':												
						receiveRequest(request);
						return;	
						
	}
		
}

exports.forwardRequest = forwardRequest;
