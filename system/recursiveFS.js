var fs = require('fs');

function getFileList(path,removeParent)
{
	if(removeParent)
		return getFileListR(path,path);
	else
		return getFileListR(path);
}

function getFileListR(path,defaultParent)//the defaultParent is removed from the paths
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
	fs.mkdir(destination,function(err){
		if(err) console.log(err);
	});
	var sourcelist = getDirectoryList(source,true);
	var i;
	for(i in sourcelist)
	{
		fs.mkdir(destination+'/'+sourcelist[i],function(err){
			if(err) console.log(err);
		});
	}
}

exports.getFileList = getFileList;
exports.getDirectoryList = getDirectoryList;
exports.createRecursiveDirectories = createRecursiveDirectories;