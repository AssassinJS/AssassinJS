//This file converts text to json for the following
// routes.txt to routes.json
// config.txt to config.json
// filetypelist.txt to filetypelist.json


	var fs = require('fs');

	var r_data = fs.readFileSync('./routes.txt');
	if(r_data==null)
	{ 
		console.log("Routes data not found");
	}
	else
	{
		var routeList = [];
		var listentries = r_data.toString().split('\n');
		for(row in listentries)
		{
			var values = listentries[row].split('\t');
			if(values.length<2 || values.length>3) continue;
			var routeObj={};
			routeObj.regexp=values[0];
			routeObj.target=values[1];
			
			if(values.length==3) 
			{
				routeObj.filters=values[2].split(',');
			}
			
			routeList.push(routeObj);
		}
		fs.writeFileSync('../routes.json',JSON.stringify(routeList));
	}
	
	var data = fs.readFileSync('./config.txt');
	if(data==null) console.log("Config data not found");
	else
	{
		var listentries = data.toString().split('\n');
		var config = {};
		for(row in listentries)
		{		
			var valuepair = listentries[row].split('\t');
			config[valuepair[0]] = valuepair[1];
		}
		fs.writeFileSync('../config.json',JSON.stringify(config));
	}
	
	var filetypemap = {};
	var data = fs.readFileSync('./filetypelist.txt');
	if(data == null)
	{
		console.log('Error in Reading filetypelist.txt:\n');
	}
	else
	{
		var listentries = data.toString().split('\n');
		
		for(row in listentries)
		{
			row = listentries[row];
			filetypemap[row.split('\t')[0].split('.')[1]] = row.split('\t')[1];
		}
		fs.writeFileSync('../filetypelist.json',JSON.stringify(filetypemap));
	}