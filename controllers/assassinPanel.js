/* assassinPanel.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is a default controller that invokes the assassinPanel UI

*/

var url = require('url');
var fs = require('fs');
var logger = require('../system/logger');
var respond = require('./respond');

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

function invoke(req,res)
{
	//First need to check of user validation credentials.
	//If valid user, then show home page
	//else redirect to login index page
	var reqDetails = url.parse(req.url);
	logger.write("Request Details To AssassinPanel: "+JSON.stringify(reqDetails));
	var filepath =reqDetails.pathname;
	if(filepath=='/assassinPanel/')
		filepath = '/assassinPanel/index.html';
	fs.readFile("."+filepath,function(err,data){
		if(err)
		{
			respond.createResponse(res,404,null,'Requested Resourse is not found on the server. Please Check the URL');
			logger.write('Error in Reading File or Missing File from AssassinPanel:\n'+err+'\n');
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

exports.invoke = invoke;
