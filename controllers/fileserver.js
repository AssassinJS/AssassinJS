var url = require('url');
var fs = require('fs');
var logger = require('../system/logger');
var respond = require('./respond');

//Reading filetypelist into filetypemap

var filetypemap = {};
ReadFileTypeList();
function ReadFileTypeList()
{
	var data = fs.readFileSync('./config/filetypelist.txt');
	if(data == null)
	{
		logger.write('Error in Reading filetypelist.txt:\n');
	}
	else
	{
		var listentries = data.toString().split('\n');
		
		for(row in listentries)
		{
			row = listentries[row];
			filetypemap[row.split('\t')[0].split('.')[1]] = row.split('\t')[1];
		}
	}
}


function serveFile(req,res,defaultDir)
{
	var reqDetails = url.parse(req.url);
	logger.write("Request Details: "+JSON.stringify(reqDetails));
	var filepath =reqDetails.pathname;
	if(defaultDir==null ||defaultDir==undefined)
		defaultDir='/public';
	if(filepath=='/')
		filepath = defaultDir+'/index.html';
	
	//fs.readFile("."+defaultDir+filepath,function(err,data){
	fs.readFile("."+filepath,function(err,data){
		if(err)
		{
			respond.createResponse(res,404,null,'Requested Resourse is not found on the server. Please Check the URL');
			logger.write('Error in Reading File or Missing File:\n'+err+'\n');
		}
		else
		{
			var extension = filepath.split('.').pop();
			logger.write('File Extension is = '+extension);
			var contenttype = filetypemap[extension];
			respond.createResponse(res,200,contenttype,data);
			logger.write('Written File Contents to Response with content-type: '+contenttype+'\n');
			
		}
	});

}

exports.serveFile = serveFile;
exports.ReadFileTypeList = ReadFileTypeList;
