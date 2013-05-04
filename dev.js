/* index.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that needs to be run by node.

*/
var rqm = require('./system/rqmodules');
var assassin = rqm.system.assassin;
var fileserver = rqm.controllers.fileserver;

//This function reads all the views in compiled_views folder
fileserver.LoadViews(function(){

//This function invokes assassin
assassin.assassinate();

});

