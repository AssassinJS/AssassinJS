var http = require('http');
var router = require('./router');
var server = http.createServer();

server.on('request',router.route);

server.listen(8000,'127.0.0.1');

console.log('Server running at http://127.0.0.1:8000');

