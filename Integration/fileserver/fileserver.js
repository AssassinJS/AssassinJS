var url = require('url');
var fs = require('fs');
var querystring = require('querystring');
var contenttypelist = require('./contenttypelist');
var logger = require('../system/logger');

function handleRequest(req,res)
{
	var reqDetails = url.parse(req.url);
	logger.write("Request Details: "+JSON.stringify(reqDetails));
	var filepath =reqDetails.pathname;
	if(filepath=='/')
		filepath = '/index.html';
	fs.readFile("."+filepath,function(err,data){
		if(err)
		{
			createResponse(res,null,'Error in Reading File or Missing File:\n'+err);
			logger.write('Error in Reading File or Missing File:\n'+err+'\n');
		}
		else
		{
			var extension = filepath.split('.').pop();
			logger.write('File Extension is = '+extension);
			var contenttype = contenttypelist.getContentType(extension);
			createResponse(res,contenttype,data);
			logger.write('Written File Contents to Response with content-type: '+contenttype+'\n');
			
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
	logger.write('Response Completed');
}

exports.handleRequest = handleRequest;
