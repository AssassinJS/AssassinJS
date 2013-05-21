var fs = require('fs');
var config = require('./config/config.json');
config.firsttime = "true";
fs.writeFileSync('./config/config.json',JSON.stringify(config));