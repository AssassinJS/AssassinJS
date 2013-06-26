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

exports.render = render;
exports.echoQueryJSON = echoQueryJSON;
