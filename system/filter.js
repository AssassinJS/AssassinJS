/* filter.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that applies the filters to requests

*/

var fs = require('fs');
var logger = require('./logger');
var controller = require('./controller');

var filters =[];

//Dynamically Reading the filters folder to get all the filters
ReadFilters();//Ensures first time execution
function ReadFilters()
{
	var filterFiles = [];
	filterFiles = fs.readdirSync('./filters/');
	filterExtensionReg = new RegExp('.js$');
	for(i in filterFiles)
	{
		var filterFile = filterFiles[i].split(filterExtensionReg)[0];
		filters[filterFile] = require('../filters/'+filterFile);
	}
}


function applyFilters(routesObj,request,response)
{
	var filterObj = {};
	for(var i in routesObj.filters)
	{
		//checking if any of the routesObj filters match with the filter modules present in the filters folder
		if(filters[routesObj.filters[i]] != undefined)
		{
			filterObj = filters[routesObj.filters[i]].applyFilter(routesObj,request,response);
			if(filterObj !=null && filterObj !=undefined && filterObj.filterStatus > 400)
				break;
		}
	}
	if(filterObj.filterMessage != undefined)
		controller.handleRequest(filterObj,request,response);
	else
		controller.handleRequest(routesObj,request,response);
}

exports.applyFilters = applyFilters;
