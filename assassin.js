/* assassin.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that initializes the server to listen on Specified Port Number and Address.
 The settings are taken from the configuration file.
 All the actions are logged using the logger.

*/

var http = require('http');

var system = [];
system['config'] = require('./system/config');
system['logger'] = require('./system/logger');
system['router'] = require('./system/router');

function assassinate()
{
	var server = http.createServer();
	var config = system.config.getConfig();
	//system.logger.write('config object='+JSON.stringify(config));
	server.on('request',system.router.route);

	if(config.assassinjsPort!=undefined && config.assassinjsAddress!=undefined)
	{
		server.listen(config.assassinjsPort,config.assassinjsAddress);
		system.logger.write('Server running at '+config.assassinjsAddress+':'+config.assassinjsPort);
	}
	else
		system.logger.write('Config Parameters not defined: port and address');
}

exports.assassinate = assassinate;

