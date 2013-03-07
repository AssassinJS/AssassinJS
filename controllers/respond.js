
function createResponse(response,StatusCode,ResponseHeader,ResponseContent)
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

exports.createResponse = createResponse;
