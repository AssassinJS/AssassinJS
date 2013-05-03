var system = [];
system['config'] = require('./system/config');
system['logger'] = require('./system/logger');
system['router'] = require('./system/router');
system['controller'] = require('./system/controller');
system['dbconnect'] = require('./system/dbconnect');
system['filter'] = require('./system/filter');
system['recursiveFS'] = require('./system/recursiveFS');
system['viewcompiler'] = require('./system/viewcompiler');

var controllers = [];
controllers['assassinPanel'] = require('./controllers/assassinPanel');
controllers['fileserver'] = require('./controllers/fileserver');
controllers['proxy_external'] = require('./controllers/proxy_external');
controllers['proxy_internal'] = require('./controllers/proxy_internal');
controllers['respond'] = require('./controllers/respond');

var filters = [];
filters['browser'] = require('./filters/browser');
filters['ipblock'] = require('./filters/ipblock');
filters['rate-limit'] = require('./filters/rate-limit');
filters['test'] = require('./filters/test');
filters['user-agent'] = require('./filters/user-agent');
filters['user-auth'] = require('./filters/user-auth');

exports.system = system;
exports.controllers = controllers;
exports.filters = filters;