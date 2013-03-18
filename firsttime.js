/* firsttime.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that needs to be run for initializing the database the first time

*/
var logger = require('./system/logger');

//To populate db from routes file
var router = require('./system/router');
router.ReadRoutesFile();
logger.write('initialized the routes collection in db','firsttime.js');

//To populate db from useragent file
var useragent = require('./filters/user-agent');
useragent.ReadUserAgentFile();
logger.write('initialized the user agent collection in db','firsttime.js');

//To Compile JSSP files to Views (production level - assuming that jssp's are already there)
var viewcompiler = require('./system/viewcompiler');
viewcompiler.readJSSP();
logger.write("compiled the JSSP's to Views",'firsttime.js');

logger.write('\n\n\tPress ctrl+c to exit...','firsttime.js');
