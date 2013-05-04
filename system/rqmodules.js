var system = [];
var controllers = [];
var filters = [];

/*

system['config'] = require('../system/config');
system['logger'] = require('../system/logger');
system['router'] = require('../system/router');
system['controller'] = require('../system/controller');
system['dbconnect'] = require('../system/dbconnect');
system['filter'] = require('../system/filter');
system['recursiveFS'] = require('../system/recursiveFS');
system['viewcompiler'] = require('../system/viewcompiler');


controllers['assassinPanel'] = require('../controllers/assassinPanel');
controllers['fileserver'] = require('../controllers/fileserver');
controllers['proxy_external'] = require('../controllers/proxy_external');
controllers['proxy_internal'] = require('../controllers/proxy_internal');
controllers['respond'] = require('../controllers/respond');


filters['browser'] = require('../filters/browser');
filters['ipblock'] = require('../filters/ipblock');
filters['rate-limit'] = require('../filters/rate-limit');
filters['test'] = require('../filters/test');
filters['user-agent'] = require('../filters/user-agent');
filters['user-auth'] = require('../filters/user-auth');
*/

var rfs = require('./recursiveFS');

var systemL = rfs.getFileList('system',true);
var controllersL = rfs.getFileList('controllers');
var filtersL = rfs.getFileList('filters');

//console.log(JSON.stringify(systemL));
//console.log(JSON.stringify(controllersL));
//console.log(JSON.stringify(filtersL));

var i;
for(i in systemL)
{
	var fileExtension = systemL[i].split('.').pop();
	if(fileExtension == 'js')
	{
		var name = systemL[i].split('/').pop().split('.')[0];
		if(name != 'rqmodules')
			system[name] = require('./'+systemL[i]);
	}
}
for(i in controllersL)
{
	var fileExtension = controllersL[i].split('.').pop();
	if(fileExtension == 'js')
	{
		var name = controllersL[i].split('/').pop().split('.')[0];
		controllers[name] = require('../'+controllersL[i]);
	}
}
for(i in filtersL)
{
	var fileExtension = filtersL[i].split('.').pop();
	if(fileExtension == 'js')
	{
		var name = filtersL[i].split('/').pop().split('.')[0];
		filters[name] = require('../'+filtersL[i]);
	}
}

//console.log(JSON.stringify(system));
//console.log(JSON.stringify(controllers));
//console.log(JSON.stringify(filters));

exports.system = system;
exports.controllers = controllers;
exports.filters = filters;