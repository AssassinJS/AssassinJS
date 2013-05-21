var fs = require('fs');
var config = require('./config/config.json');
config.useDB = "false";
fs.writeFileSync('./config/config.json',JSON.stringify(config));