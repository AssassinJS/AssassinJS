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

//This function invokes assassin
assassin.assassinate();
});
});
});

