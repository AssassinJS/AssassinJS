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
var assassinPanel = rqm.controllers.assassinPanel;
var config = rqm.system.config;

//This function invokes the firsttime
config.firsttime(function(){

//This function invokes the precompiler of jssp views
viewcompiler.readJSSP(function(){

//This function reads all the views in compiled_views folder
fileserver.LoadViews(rqm,function(){

//This function gets all the db Parameters Ready for AssassinPanel
assassinPanel.getDBParameterObjects(); //No callback here necessary

rqm.watchrqm(function(){
	//console.log('watchrqm executed');
	var toClear = require.resolve('./system/rqmodules');
	console.log('resolved require object is '+toClear);
	delete require.cache[toClear];
	rqm = require('./system/rqmodules');
	try{assassin.reloadrqm(rqm);}catch(err){console.log(err);}
	assassin = rqm.system.assassin;
	try{viewcompiler.reloadrqm(rqm);}catch(err){console.log(err);}
	viewcompiler = rqm.system.viewcompiler;
	try{fileserver.reloadrqm(rqm);}catch(err){console.log(err);}
	fileserver = rqm.controllers.fileserver;
	fileserver.LoadViews(rqm,function(){});
	try{config.reloadrqm(rqm);}catch(err){console.log(err);}
	config = rqm.system.config;
});
//This function invokes assassin
assassin.assassinate();

});
});
});

