/* router.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that maps the request URL's to those in the routes.txt file

*/

var url = require('url');
var fs = require('fs');
var controller = require('./controller');
var logger = require('./logger');
var dbconnect = require('./dbconnect');

//Reading Routes File
var routes={};

// Obsolete with database storage
ReadRoutesFile();//Ensures first time execution
function ReadRoutesFile()
{
	var r_data = fs.readFileSync('./config/routes.txt');
	if(r_data==null)
	{ 
		logger.write("Routes data not found");
	}
	else
	{
		var listentries = r_data.toString().split('\n');
		
		for(row in listentries)
		{
			var values = listentries[row].split('\t');
			var routeObj={};
			routeObj.path=values[1];
			routeObj.method=values[0];
			routeObj.target=values[2];
			if(routes[routeObj.path]===undefined && routeObj.path!=undefined) routes[routeObj.path]={};
			if(routes[routeObj.path]!=undefined)routes[routeObj.path][routeObj.method] = routeObj.target;
			//logger.write('routeObj = '+JSON.stringify(routeObj)+' and routes= '+JSON.stringify(routes));
		}
		//logger.write('routes object = '+JSON.stringify(routes));
	}
}


function ReadFromDB()
{
	
}

//Actual Routing Function
function route(request,response)
{			
	var reqDetails = url.parse(request.url);
	logger.write("Request Details: "+JSON.stringify(reqDetails));
	var filepath = reqDetails.pathname;
	
	for(i in routes)
	{
		var urlReg = new RegExp('^'+i.toString()+'$');
		logger.write('filepath='+filepath+' and i ='+i+' urlReg='+urlReg);
		if(urlReg.test(filepath))
		{
			logger.write('filepath='+filepath+' matched urlReg='+urlReg);
			controller.handleRequest(routes[i],request,response);
			return;
		}
	}
	logger.write('URL not found');
	controller.handleRequest(routes[filepath],request,response);
	
}

exports.route = route;
exports.ReadRoutesFile = ReadRoutesFile;
