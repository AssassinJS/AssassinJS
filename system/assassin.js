/* assassin.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that initializes the server to listen on Specified Port Number and Address.
 The settings are taken from the configuration file.
 All the actions are logged using the logger.

*/

var http = require('http');

var system = [];
system['config'] = require('./config');
system['logger'] = require('./logger');
system['router'] = require('./router');

function assassinate()
{
	var server = http.createServer();
	var config = system.config.getConfig();
	var port = (process.env.VMC_APP_PORT || process.env.OPENSHIFT_NODEJS_PORT ||  process.env.OPENSHIFT_INTERNAL_PORT || config.assassinjsPort);
	var host = (process.env.VMC_APP_HOST || process.env.OPENSHIFT_NODEJS_IP || process.env.OPENSHIFT_INTERNAL_IP || config.assassinjsAddress);
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

function reloadrqm(rqm)
{
try{system['config'].reloadrqm(rqm);}catch(err){console.log(err);}
system['config'] = rqm.system.config;
try{system['logger'].reloadrqm(rqm);}catch(err){console.log(err);}
system['logger'] = rqm.system.logger;
try{system['router'].reloadrqm(rqm);}catch(err){console.log(err);}
system['router'] = rqm.system.router;
}

exports.assassinate = assassinate;
exports.reloadrqm = reloadrqm;
