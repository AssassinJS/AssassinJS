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
	var port = (process.env.VMC_APP_PORT || config.assassinjsPort);
	var host = (process.env.VMC_APP_HOST || config.assassinjsAddress);
	//system.logger.write('config object='+JSON.stringify(config));
	server.on('request',system.router.route);

	if(port!=undefined && host!=undefined)
	{
		//server.listen(config.assassinjsPort,config.assassinjsAddress);
		server.listen(port,host);
		system.logger.write('Server running at '+host+':'+port);
	}
	else
		system.logger.write('Config Parameters not defined: port and address');
}

exports.assassinate = assassinate;
