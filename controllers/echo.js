var fileserver = require('./fileserver');

function render(req,res)
{
	fileserver.serveFile(req,res,null,null);
}

exports.render = render;
