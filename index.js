/* index.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that needs to be run by node.

*/
//require("cf-autoconfig");
var rqm = require('./system/rqmodules');
var assassin = rqm.system.assassin;
var viewcompiler = rqm.system.viewcompiler;
var fileserver = rqm.controllers.fileserver;
var config = rqm.system.config;

//This function invokes the firsttime
config.firsttime(function(){

//This function invokes the precompiler of jssp views
viewcompiler.readJSSP(function(){

//This function reads all the views in compiled_views folder
fileserver.LoadViews(function(){
rqm.watchrqm(function(){
	//console.log('watchrqm executed')
	var toClear = require.resolve('./system/rqmodules');
	console.log('resolved require object is '+toClear);
	delete require.cache[toClear];
	rqm = require('./system/rqmodules');
	assassin.reloadrqm(rqm);
	assassin = rqm.system.assassin;
	viewcompiler.reloadrqm(rqm);
	viewcompiler = rqm.system.viewcompiler;
	fileserver.reloadrqm(rqm);
	fileserver = rqm.controllers.fileserver;
	config.reloadrqm(rqm);
	config = rqm.system.config;
});
//This function invokes assassin
assassin.assassinate();
});
});
});

