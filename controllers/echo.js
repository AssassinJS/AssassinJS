var fileserver = require('./fileserver');
var respond = require('./respond');
var url = require('url');

function render(req,res)
{
	fileserver.serveFile(req,res,null,null);
}

function echoQueryJSON(req,res)
{
	var ct = {'Content-Type': 'application/json'};
	var rc = JSON.stringify(url.parse(req.url,true).query);
	respond.createResponse(res,200,ct,rc);
}

function echoQueryHTML(req,res)
{
	var ct = {'Content-Type': 'text/html'};
	var rc = '<html><head></head><body>'+JSON.stringify(url.parse(req.url,true).query)+'</body></html>';
	respond.createResponse(res,200,ct,rc);
}

exports.render = render;
exports.echoQueryJSON = echoQueryJSON;
exports.echoQueryHTML = echoQueryHTML;
