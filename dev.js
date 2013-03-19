/* dev.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that needs to be run by node.
 (developmental purposes... index.js is production level, dev.js is dev level)

*/

var assassin = require('./assassin');
var viewcompiler = require('./system/viewcompiler');

//This function invokes the precompiler of jssp views
viewcompiler.readJSSP();

//This function invokes assassin
assassin.assassinate();
