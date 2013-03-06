var common = require('./common');
var url = require('url');
var queryutil = require('querystring');
var dbconnect = require('../../db/dbconnect');

function forwardRequest(request,response)
{	
	this.get = function(request,response)
	{
		var params = url.parse(request.url).query;	
		console.log('query is '+params);		
		var searchobj = queryutil.parse(params);
		console.log(searchobj);
		dbconnect.db_ready(function(db){
		
				var collection = db.collection('nodethings');
				
				collection.find(searchobj).toArray(function(err,data)
				{
					var result = JSON.stringify(data);
					console.log(result);		
					response.writeHead(200,{'content-type':'text/plain'});			
					response.write(result);				 
					response.end();
				});				
		});
				
	};
	
	this.put = function(request,response)
	{
		var params = url.parse(request.url).query;	
		console.log('query is '+params);		
		var insertobj = queryutil.parse(params);		
		dbconnect.db_ready(function(db){
		
				var collection = db.collection('nodethings');
				
				collection.insert(insertobj,{w:1},function(err,data)
				{
					var result = JSON.stringify(data);
					console.log(result);		
					response.writeHead(200,{'content-type':'text/plain'});			
					response.write(result);				 
					response.end();
				});				
		});
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
		common.errorEcho(request,response);
	}
}

exports.forwardRequest = forwardRequest;
