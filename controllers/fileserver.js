//Required Modules
var url = require('url');
var fs = require('fs');
var logger = require('../system/logger');
var rfs = require('../system/recursiveFS');
var respond = require('./respond');
var rqm = require('../system/rqmodules');

//Global Variabels in this module
var filetypemap = require('../config/filetypelist.json');
var defaultFile = require('../config/config.json').fileDefault;
var ViewsList = {};


function reloadrqm(rqm)
{
logger.reloadrqm(rqm);
logger = rqm.system.logger;
rfs.reloadrqm(rqm);
rfs = rqm.system.recursiveFS;
respond.reloadrqm(rqm);
respond = rqm.controllers.respond;
rqm = rqm;
}


//Not necessary if filetypelist.json is present
//var filetypemap = {};
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

function LoadViews(callback)
{
	var ViewFiles = [];
	ViewFiles = rfs.getFileList('compiled_views',true);
	for(i in ViewFiles)
	{
		LoadView(ViewFiles[i]);
		WatchViews(ViewFiles[i]);
	}
	callback();
	return;
}

function LoadView(ViewFile)
{
	ViewExtensionReg = new RegExp('.js$');
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
	fs.watchFile('./compiled_views/'+ViewFile,{persistent: true, interval: 500 },function (curr, prev) {
		//logger.write('the current mtime is: ' + curr.mtime,'views in fileserver.js');
		//logger.write('the previous mtime was: ' + prev.mtime,'views in fileserver.js');
		//if(curr.mtime.getTime() != prev.mtime.getTime())
		if(curr.mtime != prev.mtime)
		{
			LoadView(ViewFile);
			logger.write("called LoadView again for "+ViewFile,'fileserver.js');
			//logger.write("called LoadView again for "+ViewFile+'\nthe current mtime is: ' + curr.mtime+'\ncurr is ' +JSON.stringify(curr)+'\nthe previous mtime was: ' +prev.mtime +'\nprev is '+JSON.stringify(prev),'fileserver.js');
		}
	});
}

function serveFile(req,res,defaultDir,dataObj)
{
	var reqDetails = url.parse(req.url);
	//logger.write("Request Details: "+JSON.stringify(reqDetails),'serveFile in fileserver');
	var filepath =reqDetails.pathname;
	//filepath = filepath.split('/'+filepath.split('/')[1])[1];
	logger.write('filepath is '+filepath,'fileserver.js');
	if(defaultDir==null ||defaultDir==undefined)
		defaultDir='public';
	var filepathreg = /\/$/g;
	//logger.write('defaultFile '+defaultFile);
	if(filepathreg.test(filepath)==true) filepath = filepath+defaultFile;
	if(filepath == '/' || filepath == '' || filepath == null || filepath == undefined)
		filepath = '/'+defaultFile;
	//logger.write('filepath is '+filepath);
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
			//respond.createResponse(res,404,null,'Requested Resourse is not found on the server. Please Check the URL');
			serveError(req,res,404,'Requested Resourse is not found on the server. Please Check the URL');
			logger.write('Error in Reading File or Missing File:\n'+err+'\n');
		}
		else
		{
			var contenttype = filetypemap[fileextension];
			respond.createResponse(res,200,{'Content-Type': contenttype},data);
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
	//filepath = filepath.split('/'+filepath.split('/')[1])[1];
	//logger.write('filepath is '+filepath,'serveView in fileserver');
	var filepathreg = /\/$/g;
	//logger.write('defaultFile '+defaultFile);
	if(filepathreg.test(filepath)==true) filepath = filepath+defaultFile;
	if(filepath == '/' || filepath == '' || filepath == null || filepath == undefined)
		filepath = '/'+defaultFile;
	filepath = filepath+'.js';
	var toServe = ViewsList[filepath];
	if(toServe!=null || toServe!=undefined)
	{		
		//Third param is the RequiredModules object rqm
		//Fourth param is optional which is a dataObj
		toServe.render(req,res,rqm,dataObj);
		logger.write('View Rendered:\n','fileserver.js');
	}
	else
	{
		//respond.createResponse(res,404,null,'Requested Resourse is not found on the server. Please Check the URL');
		serveError(req,res,404,'Requested Resourse is not found on the server. Please Check the URL');
		logger.write('Error in Reading View or Missing View:\n');
	}
}

function serveError(req,res,status,message)
{
	var toServe = ViewsList['/error.jssp.js'];
	var dataObj = {};
	dataObj.errorMessage = message;
	dataObj.errorStatus = status;
	if(toServe!=null || toServe!=undefined)
	{		
		//Third param is the RequiredModules object rqm
		//Fourth param is optional which is a dataObj
		toServe.render(req,res,rqm,dataObj);
		logger.write('error.jssp View Rendered','fileserver.js');
	}
	else
	{
		respond.createResponse(res,status,null,message);
		logger.write('Error in Reading error.jssp View','fileserver.js');
	}
}

//Actual Processing Area
//To Read FileType List
//ReadFileTypeList();
//To Load Views
//LoadViews();

exports.serveFile = serveFile;
exports.serveView = serveView;
exports.serveError = serveError;
exports.ReadFileTypeList = ReadFileTypeList;
exports.LoadViews = LoadViews;
exports.reloadrqm = reloadrqm;