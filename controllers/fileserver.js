//Required Modules
var url = require('url');
var fs = require('fs');
var logger = require('../system/logger');
var respond = require('./respond');

//Global Variabels in this module
var filetypemap = {};
var ViewsList = {};

//Reading filetypelist into filetypemap
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

function LoadViews()
{
	var ViewFiles = [];
	ViewFiles = fs.readdirSync('./compiled_views/');
	ViewExtensionReg = new RegExp('.js$');
	for(i in ViewFiles)
	{
		LoadView(ViewFiles[i]);
		WatchViews(ViewFiles[i]);
	}
}

function LoadView(ViewFile)
{
	if(ViewExtensionReg.test(ViewFile))
	{
		//To clear the previous cache
		var toClear = require.resolve('../compiled_views/'+ViewFile);
		//logger.write('resolved require object is '+toClear,'fileserver.js');
		delete require.cache[toClear];
			
		//logger.write('ViewFile is '+ViewFile,'fileserver.js');
		ViewsList['/'+ViewFile] = require('../compiled_views/'+ViewFile);	
	}
}

function WatchViews(ViewFile)
{
	fs.watchFile('./compiled_views/'+ViewFile,{persistent: true, interval: 1000 },function (curr, prev) {
		//logger.write('the current mtime is: ' + curr.mtime,'views in fileserver.js');
		//logger.write('the previous mtime was: ' + prev.mtime,'views in fileserver.js');
		if(curr.mtime != prev.mtime)
		{
			LoadView(ViewFile);
			logger.write("called LoadView again for "+ViewFile,'fileserver.js');
		}
	});
}

function serveFile(req,res,defaultDir,dataObj)
{
	var reqDetails = url.parse(req.url);
	logger.write("Request Details: "+JSON.stringify(reqDetails),'serveFile in fileserver');
	var filepath =reqDetails.pathname;
	filepath = filepath.split('/'+filepath.split('/')[1])[1];
	logger.write('filepath is '+filepath);
	if(defaultDir==null ||defaultDir==undefined)
		defaultDir='public';
	if(filepath == '/' || filepath == '' || filepath == null || filepath == undefined)
		filepath = '/index.html';
	var fileextension = filepath.split('.').pop();
	//logger.write('fileextension is '+fileextension,'serveFile in fileserver');
	if(fileextension =='jssp')
		serveView(req,res,dataObj);
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
			var contenttype = filetypemap[fileextension];
			respond.createResponse(res,200,contenttype,data);
			logger.write('Written File Contents to Response with content-type: '+contenttype+'\n');
		}
	});
	}
}

function serveView(req,res,dataObj)
{
	var reqDetails = url.parse(req.url);
	//logger.write("Request Details: "+JSON.stringify(reqDetails),'serveView in fileserver');
	var filepath =reqDetails.pathname;
	filepath = filepath.split('/'+filepath.split('/')[1])[1];
	//logger.write('filepath is '+filepath,'serveView in fileserver');
	
	if(filepath == '/' || filepath == '' || filepath == null || filepath == undefined)
		filepath = '/index.jssp';
	filepath = filepath+'.js';
	var toServe = ViewsList[filepath];
	if(toServe!=null || toServe!=undefined)
	{		
		toServe.render(req,res,dataObj); //Third optional param is a data object
		logger.write('View Rendered:\n','fileserver.js');
	}
	else
	{
		respond.createResponse(res,404,null,'Requested Resourse is not found on the server. Please Check the URL');
		logger.write('Error in Reading View or Missing View:\n');
	}
}

//Actual Processing Area
//To Read FileType List
ReadFileTypeList();
//To Load Views
LoadViews();

exports.serveFile = serveFile;
exports.serveView = serveView;
exports.ReadFileTypeList = ReadFileTypeList;
exports.LoadViews = LoadViews;
