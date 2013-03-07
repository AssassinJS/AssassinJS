/* config.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that reads the configuration parameters for AssassinJS.

*/


//Reading Configuration Parameters
var fs = require('fs');
var logger = require('./logger');

var config = {};
var data = fs.readFileSync('./system/config.txt');
if(data==null) logger.write("Config data not found");
else
{
	var listentries = data.toString().split('\n');
	
	for(row in listentries)
	{		
		var valuepair = listentries[row].split('\t');
		//logger.write(listentries[row]+','+valuepair);
		config[valuepair[0]] = valuepair[1];
	}
	
}


//Reading Routes File
var routes={};

var r_data = fs.readFileSync('./system/routes.txt');
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
		
}

function getConfig()
{
	logger.write('returning config = '+JSON.stringify(config));
	return config;
}

function getRoutes()
{
	logger.write('returning routes = '+JSON.stringify(routes));
	return routes;
}

exports.getConfig = getConfig;
exports.getRoutes = getRoutes;

