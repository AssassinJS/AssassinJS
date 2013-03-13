/* filter.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that applies the filters to requests

*/

var fs = require('fs');
var logger = require('./logger');

var filters =[];

//Dynamically Reading the filters folder to get all the filters
ReadFilters();//Ensures first time execution
function ReadFilters()
{
	var filterFiles = [];
	filterFiles = fs.readdirSync('./controllers/');
	filterExtensionReg = new RegExp('.js$');
	for(i in filterFiles)
	{
		var filterFile = filterFiles[i].split(filterExtensionReg)[0];
		filters[filterFile] = require('../filters/'+filterFile);
	}
}


function applyFilters(routesObj,request,response)
{
	logger.write('filters = '+JSON.stringify(routesObj.filters),'filter.js');
	var filterObj = {};
	for(var i in routesObj)
	{
		//checking if any of the routesObj filters match with the filter modules present in the filters folder
		if(filters.indexOf(routesObj[i]) != -1)
		{
			filterObj = filters[routesObj[i]].applyFilter(routesObj,request,response);
			if(filterObj.filterStatus > 400)
				break;
		}
	}
	if(filterObj.filterMessage != undefined)
		controller.handleRequest(routes[i],request,response);
	else
	{
		controller.handleRequest(filterObj,request,response)
	}
}

exports.applyFilters = applyFilters;
