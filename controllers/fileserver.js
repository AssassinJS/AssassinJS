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


function serveFile(req,res,defaultDir,dataObj)
{
	var reqDetails = url.parse(req.url);
	logger.write("Request Details: "+JSON.stringify(reqDetails),'serveFile in fileserver');
	var filepath =reqDetails.pathname;
	filepath = filepath.split('/'+filepath.split('/')[1])[1];
	logger.write('filepath is '+filepath);
	if(defaultDir==null ||defaultDir==undefined)
		defaultDir='/public';
	if(filepath == '/' || filepath == '' || filepath == null || filepath == undefined)
		filepath = '/index.html';
	if(defaultDir == 'views')
	{
		serveView(req,res,dataObj);
	}
	else
	{
	fs.readFile("./"+defaultDir+filepath,function(err,data){
	//fs.readFile("."+filepath,function(err,data){
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
}

function serveView(req,res,dataObj)
{
	var reqDetails = url.parse(req.url);
	logger.write("Request Details: "+JSON.stringify(reqDetails),'serveView in fileserver');
	var filepath =reqDetails.pathname;
	filepath = filepath.split('/'+filepath.split('/')[1])[1];
	logger.write('filepath is '+filepath,'serveView in fileserver');
	var fileextension = filepath.split('.')[1];
	logger.write('fileextension is '+fileextension,'serveView in fileserver');
	if(fileextension !='html' && fileextension !='htm')
		serveFile(req,res,null);
	else
	{
	filepath = filepath.replace('.'+fileextension,'.js');
	if(filepath == '/' || filepath == '' || filepath == null || filepath == undefined)
		filepath = '/index.js';
	fs.exists('./views'+filepath,function(exists){
		if(exists)
		{
			var toServe = require('../views'+filepath);
			toServe.render(req,res,dataObj); //Second optional param is a data object
			logger.write('View Rendered:\n','fileserver.js');
		}
		else
		{
			respond.createResponse(res,404,null,'Requested Resourse is not found on the server. Please Check the URL');
			logger.write('Error in Reading View or Missing View:\n');
		}
	});
	
	}
}

exports.serveFile = serveFile;
exports.serveView = serveView;
exports.ReadFileTypeList = ReadFileTypeList;
