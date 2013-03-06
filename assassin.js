/* index.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that needs to be run by node.
 It initializes the server to listen on Specified Port Number and Address.
 The settings are taken from the configuration file.
 All the actions are logged using the logger.

*/

var http = require('http');

var system = [];
system['config'] = require('./system/config');
system['logger'] = require('./system/logger');
system['router'] = require('./system/router');

var server = http.createServer();

var config = system.config.getConfig();
system.logger.write('config object='+JSON.stringify(config));
server.on('request',system.router.route);

if(config.port!=undefined && config.address!=undefined)
{
	server.listen(config.port,config.address);
	system.logger.write('Server running at '+config.address+':'+config.port);
}
else
	system.logger.write('Config Parameters not defined: port and address');

