var fs = require('fs');
var logger = require('./logger');

function reloadrqm(rqm)
{
try{logger.reloadrqm(rqm);}catch(err){console.log(err);}
logger = rqm.system.logger;
}

function getFileList(path,removeParent,extension)
{
	if(removeParent)
		return getFileListR(path,path,extension);
	else
		return getFileListR(path,null,extension);
}

function getFileListR(path,defaultParent,extension)//the defaultParent is removed from the paths
{
	//console.log('path is '+path+' and defaultParent is '+defaultParent);
	var filelist = fs.readdirSync(path);
	//console.log('filelist is '+JSON.stringify(filelist));
	var toReturn = [];
	var i,j;
	for(i in filelist)
	{
		var innerPath = path+'/'+filelist[i];
		var stats = fs.statSync(innerPath);
		if(stats.isDirectory())
		{
			var innerFileList = getFileListR(innerPath,defaultParent);
			toReturn = toReturn.concat(innerFileList);
		}
		else
		{
			if(extension!=null && extension!=undefined && extension!='' && extension != innerPath.split('.').pop().toLowerCase())
				break;
			
			if(defaultParent!=null && defaultParent!=undefined && defaultParent!='')
			{
				var dPReg = new RegExp('^'+defaultParent+'/');
				toReturn.push(innerPath.split(dPReg)[1]);
			}
			else
				toReturn.push(innerPath);
		}
		
	}
	return toReturn;
}

function getDirectoryList(path,removeParent)
{
	if(removeParent)
		return getDirectoryListR(path,path);
	else
		return getDirectoryListR(path);
}

function getDirectoryListR(path,defaultParent)//the defaultParent is removed from the paths
{
	//console.log('path is '+path);
	var dirlist = fs.readdirSync(path);
	var toReturn = [];
	var i,j;
	for(i in dirlist)
	{
		var innerPath = path+'/'+dirlist[i];
		var stats = fs.statSync(innerPath);
		if(stats.isDirectory())
		{
			if(defaultParent!=null && defaultParent!=undefined && defaultParent!='')
			{
				var dPReg = new RegExp('^'+defaultParent+'/');
				toReturn.push(innerPath.split(dPReg)[1]);
			}
			else
				toReturn.push(innerPath);
			var innerDirList = getDirectoryListR(innerPath,defaultParent);
			toReturn = toReturn.concat(innerDirList);
		}
	}
	return toReturn;
}

function createRecursiveDirectories(source,destination)
{
	//Synchronous Version
	try
	{
		fs.mkdirSync(destination);
	}
	catch(err)
	{
		if(err.code=='EEXIST') logger.write('Path '+destination+' Exists','recursiveFS.js');
		else logger.write('ERROR '+err,'recursiveFS.js');
	}
	var sourcelist = getDirectoryList(source,true);
	var i;
	for(i in sourcelist)
	{
		try
		{
			fs.mkdirSync(destination+'/'+sourcelist[i]);
		}
		catch(err)
		{
			if(err.code=='EEXIST') logger.write('Path '+destination+' Exists','recursiveFS.js');
			else logger.write('ERROR '+err,'recursiveFS.js');
		}
	}
	/*
	//Asynchronous version
	fs.mkdir(destination,function(err){
		if(err)
		{
			if(err.code == 'EEXIST') logger.write('Path '+destination+' Exists','recursiveFS.js');
			else logger.write('ERROR '+err,'recursiveFS.js');
		}
		else
		{
			var sourcelist = getDirectoryList(source,true);
			var i;
			for(i in sourcelist)
			{
				fs.mkdir(destination+'/'+sourcelist[i],function(err){
					if(err)
					{
						if(err.code == 'EEXIST') logger.write('Path '+destination+'/'+sourcelist[i]+' Exists','recursiveFS.js');
						else logger.write('ERROR '+err,'recursiveFS.js');
					}
				});
			}
		}
	});
	*/
}

function watchRecursive(path,callback)
{
	//console.log('calling wR() for path: '+path);
	if(fs.statSync(path).isDirectory())
	{	
		//console.log(path+' is directory');
		var flist = fs.readdirSync(path);
		//console.log(JSON.stringify(flist));
		for(var i in flist)
			watchRecursive(path+'/'+flist[i],callback);
	}
	//console.log('after if case : '+path);
	else
	{
		fs.watch(path,function(event,filename){
			if(callback!=undefined && callback!=null)
				callback(event,filename,path);
			else
				console.log('file: '+filename+' caused an event: '+event+' at path: '+path);
		});
	//console.log('after watching : '+path);
	}
}


exports.getFileList = getFileList;
exports.getDirectoryList = getDirectoryList;
exports.createRecursiveDirectories = createRecursiveDirectories;
exports.watchRecursive = watchRecursive;
exports.reloadrqm = reloadrqm;