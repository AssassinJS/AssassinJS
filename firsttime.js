/* firsttime.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that needs to be run for initializing the database the first time

*/
var logger = require('./system/logger');

//To populate db from routes file
var router = require('./system/router');
router.ReadRoutesFile();

//To populate db from useragent file
var useragent = require('./filters/user-agent');
useragent.ReadUserAgentFile();

logger.write('\n\n\tPress ctrl+c to exit...','firsttime.js');
