/* config.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that reads the configuration parameters for AssassinJS.

*/

var fs = require('fs');
var logger = require('./logger');

var config = {};

//Reading Configuration Parameters
ReadConfigFile();//This ensures first time execution
function ReadConfigFile()
{

	var data = fs.readFileSync('./config/config.txt');
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
}

function getConfig()
{
	logger.write('returning config = '+JSON.stringify(config));
	return config;
}

exports.getConfig = getConfig;
exports.ReadConfigFile = ReadConfigFile;

