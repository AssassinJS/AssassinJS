var http = require('http');
var url = require('url');
var fs = require('fs');
var querystring = require('querystring');
var $ = require('jquery');

http.createServer(handleRequest).listen(80, '127.0.0.1');
console.log('Server running at http://127.0.0.1:80/');

function handleRequest(req,res)
{
	var reqDetails = url.parse(req.url);
	logger("Request Details: "+JSON.stringify(reqDetails));
	var filepath =reqDetails.pathname;
	if(filepath=='/')
		filepath = '/index.html';
	fs.readFile("."+filepath,function(err,data){
		if(err)
		{
			createResponse(res,null,'Error in Reading File or Missing File:\n'+err);
			logger('Error in Reading File or Missing File:\n'+err+'\n');
		}
		else
		{
			fs.readFile('filetypelist.txt',function(err,data2){
				if(err)
				{
					logger('Error in Reading filetypelist.txt:\n'+err+'\n');
				}
				else
				{
					var extension = filepath.split('.').pop();
					var filetypemap = {};
					var listentries = data2.toString().split('\n');
					$.each(listentries,function(key,value){
						filetypemap[value.split('\t')[0].split('.')[1]] = value.split('\t')[1];
					});
					logger('File Extension is = '+extension);
					
					var contenttype=filetypemap[extension];
					createResponse(res,contenttype,data);
					logger('Written File Contents to Response with content-type: '+contenttype+'\n');
				}
			});
		}
	});

}

function createResponse(res,ResponseHeader,ResponseContent)
{
	if(ResponseHeader == null)
	{
		ResponseHeader = {'Content-Type': 'text/plain'}
	}
	res.writeHead(200, ResponseHeader);
	res.write(ResponseContent);
	res.end();
	logger('Response Completed');
}

function logger(data)
{
	var entry = 'Time: '+new Date()+' Message: '+data+'\n';
	fs.appendFile('log.txt',entry,function(err){
		if(err){console.log('Log NOT Appended with data:\n\t'+entry);}
		else{console.log('Log Appended with data:\n\t'+entry);}
	});
}

