var fs=require('fs');
var $ = require('jquery');
var logger = require('../system/logger');

var filetypemap = {};

fs.readFile('./fileserver/filetypelist.txt',function(err,data2){
	if(err)
	{
		logger.write('Error in Reading filetypelist.txt:\n'+err+'\n');
	}
	else
	{
		var listentries = data2.toString().split('\n');
		
		for(row in listentries)
		{
			row = listentries[row];
			filetypemap[row.split('\t')[0].split('.')[1]] = row.split('\t')[1];
		}
		
	}
});

function getContentType(extension)
{
	return filetypemap[extension];
}
exports.getContentType = getContentType;
