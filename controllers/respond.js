function __createResponse(response,StatusCode,ResponseHeader,ResponseContent)
{
	if(ResponseHeader == null)
	{
		ResponseHeader = {'Content-Type': 'text/plain'}
	}
	if(StatusCode == null)
		StatusCode = 200;
	response.writeHead(StatusCode, ResponseHeader);
	response.write(ResponseContent);
	response.end();
}

function reloadrqm(rqm)
{
//nothing to do here :P
}

exports.createResponse = __createResponse;
exports.reloadrqm = reloadrqm;