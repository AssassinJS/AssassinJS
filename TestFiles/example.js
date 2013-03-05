var http = require('http');
var url = require('url');
var dns = require('dns');
var fs = require('fs');
var $ = require('jquery');

http.createServer(handleRequest).listen(1338, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1338/');

function handleRequest(req,res)
{
	var reqDetails = url.parse(req.url);
	console.log(reqDetails);
	fs.appendFile('log.txt',JSON.stringify(reqDetails)+'\n',function(err){
		console.log('Log Appended - Request Details...');
	});
	fs.readFile('testindex.htm',function(err,data){
		res.writeHead(200, {'Content-Type': 'text/html'});
		if(err)
		{
			
			res.write('Error.... Please Debug ;) \n'+err);
			console.log('Error:\n'+err);
			
		}
		else
		{
			var testIndexHtml = data.toString();
			$testIndexHtml = $(testIndexHtml);
			$contentDiv = $('#contentWrapper',$testIndexHtml);
			$contentDiv.append(JSON.stringify(reqDetails));
			
			res.write($testIndexHtml.html());
		}
		res.end();
		console.log('Response Created');
	});
	
	
}
