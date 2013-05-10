/* logger.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that logs actions when called

*/

var fs = require('fs');

function write(data,filename)
{
	var entry = 'Time: '+new Date();
	if(filename !=null || filename != undefined) entry = entry+'\n\tFile: '+filename;
	if(data !=null || data != undefined) entry = entry+'\n\tMessage: '+data;
	entry = entry+'\n';
	
	fs.appendFile('./system/log.txt',entry,function(err){
		if(err){console.log('Log NOT Appended with data:\n\t'+entry);}
		else{console.log('Log Appended with data:\n\t'+entry);}
	});
}

function moduleInfo(theModule)
{
	var infoString = '';
	for(i in theModule)
		infoString = infoString+i+'='+theModule[i]+'\t';
	var entry = 'Time: '+new Date()+'\n\tModule Information: '+infoString+'\n';
	
	fs.appendFile('./system/log.txt',entry,function(err){
		if(err){console.log('Log NOT Appended with data:\n\t'+entry);}
		else{console.log('Log Appended with data:\n\t'+entry);}
	});
}

function reloadrqm(rqm)
{
//nothing to reload here :P
}

exports.write = write;
exports.moduleInfo = moduleInfo;
exports.reloadrqm = reloadrqm;
