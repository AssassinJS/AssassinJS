
function errorResponse(request,response)
{
	ResponseHeader = {'Content-Type': 'text/plain'}
	ResponseContent = 'Requested Resourse is not found on the server. Please Check the URL';
	res.writeHead(404, ResponseHeader);
	res.write(ResponseContent);
	res.end();
}

exports.errorResponse = errorResponse;
