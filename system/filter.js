/* filter.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that applies the filters to requests

*/

var fs = require('fs');
var logger = require('./logger');
var controller = require('./controller');

var filters = [];

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

function reloadrqm(rqm)
{
try{controller.reloadrqm(rqm);}catch(err){console.log(err);}
controller = rqm.system.controller;
try{logger.reloadrqm(rqm);}catch(err){console.log(err);}
logger = rqm.system.logger;
for(var i in filters)
{
	try{filters[i].reloadrqm(rqm);}catch(err){console.log(err);}
}
filters = rqm.filters;
}

function applyFilters(routesObj,request,response)
{
	var filterObj = routesObj;
	if(filterObj.filterStatus!=undefined && filterObj.filterStatus!='200')
		return filterObj;
	else 
		filterObj.filterStatus='200';//default value
	for(i in routesObj.filters)
	{
		//checking if any of the routesObj filters match with the filter modules present in the filters folder
		if(filters[routesObj.filters[i]] != undefined)
		{
			filterObj = filters[routesObj.filters[i]].applyFilter(routesObj,request,response);
			if(filterObj.filterStatus!='200')
				break;
		}
	}
	
	controller.handleRequest(filterObj,request,response);
	
}

function applyGeneralFilters(routesObj,request,response)
{
	//logger.write('routesObj in aGF: '+JSON.stringify(routesObj),'analytics.js');
	var filterObj = routesObj;
	if(filterObj.filterStatus!=undefined && filterObj.filterStatus!='200')
		return filterObj;
	else 
		filterObj.filterStatus='200';//default value
	var generalFilters = require('../config/generalfilters.json');
	for(i in generalFilters)
	{
		//checking if any of the routesObj filters match with the filter modules present in the filters folder
		if(filters[generalFilters[i]] != undefined)
		{
			//logger.write('generalFilter: '+JSON.stringify(generalFilters[i]),'analytics.js');
			filterObj = filters[generalFilters[i]].applyFilter(filterObj,request,response);
			if(filterObj.filterStatus!='200')
				break;
		}
	}
	
	return filterObj;
	
}

exports.applyFilters = applyFilters;
exports.applyGeneralFilters = applyGeneralFilters;
exports.reloadrqm = reloadrqm;
