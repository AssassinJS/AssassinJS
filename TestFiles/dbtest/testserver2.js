var http = require('http');
var url = require('url');
var dns = require('dns');
var fs = require('fs');
var querystring = require('querystring');
var $ = require('jquery');
var MongoClient = require('mongodb').MongoClient;

http.createServer(handleRequest).listen(8080, '127.0.0.1');
console.log('Server running at http://127.0.0.1:8080/');

function handleRequest(req,res)
{
	var reqDetails = url.parse(req.url);
	console.log(reqDetails);
	fs.appendFile('log.txt',JSON.stringify(reqDetails)+'\n',function(err){
		console.log('Log Appended - Request Details...');
	});
	
	var ResponseString;
	
	var collection;
	MongoClient.connect("mongodb://localhost:27017/mydb",function(err,db){
		if(err){
			console.log("Connection Error! ");
		}

		db.createCollection('testServer',{w:1},function(err,collection){
			if(err){
				console.log("Collection Creation Error!\n\t(or)\nCollection Already Exists!");
			}
		});
		
		collection = db.collection('testServer');
		var URLquery = querystring.parse(reqDetails.query);
	if(reqDetails.pathname == '/db/put')
	{
		console.log("Entered db-put ");
		var doc = {};
		if(URLquery.key=="")
		{
			createResponse(res,'Insertion Failed!');
			console.log('Insertion Failed!');
			return;
		}
		doc[URLquery.key] = URLquery.value;
		collection.insert(doc,function(err,result){
			if(err){
				createResponse(res,'Insertion Failed!');
				console.log('Insertion Failed!');
			}
			else {
				createResponse(res,'Insertion Completed :)');
				console.log('Insertion Completed');
			}
		});
	}
	else if(reqDetails.pathname == '/db/get')
	{
		console.log("Entered db-get ");
		var dbActionResponse = '';
		var doc = {};
		doc[URLquery.key] = '1';
		collection.find({},doc).toArray(function(err,items){
			$(items).each(function(){
				dbActionResponse += "Item: "+JSON.stringify(this)+"\n";
			});
			createResponse(res,dbActionResponse);
			console.log(dbActionResponse);
		});
	}
	else
	{
		console.log("Entered normal index handler ");
		fs.readFile('index.html',function(err,data){
	
			if(err)
			{
				
				createResponse(res,'Error.... Please Debug ;) \n'+err);
				console.log('Error:\n'+err);
				
			}
			else
			{
				var testIndexHtml = data.toString();
				$testIndexHtml = $(testIndexHtml);
				$contentDiv = $('#contentWrapper',$testIndexHtml);
				$contentDiv.append(JSON.stringify(reqDetails));
				
				createResponse(res,$testIndexHtml.html());
				console.log('Written html string to response\n');
			}

		});
	}
	});
	

	
}

function createResponse(res,ResponseString)
{
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write(ResponseString);
	res.end();
	console.log('Response Created');
}
