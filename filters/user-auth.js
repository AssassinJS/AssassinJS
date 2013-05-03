//This filter implements user authentication filter based on the HTTP1.1 Authorization header with a custom schema
var logger = require('../system/logger');
var url = require('url');

var MyMongo = require('../system/dbconnect').MyMongo;
var db = new MyMongo('localhost','27017','assassindb');

var userAuth = {};

function ReadFromDB()
{
	db.query('filterParameters',function(collection){		
		collection.find({filter:'user-auth'},{parameters:1}).nextObject(function(err,doc){					
			if(err)
			{
				logger.write('Error while reading user-auth: '+JSON.stringify(err),'user-auth.js');
			}
			else if(doc)
			{												
				for(index in doc.parameters)
					userAuth[doc.parameters[index].email] = doc.parameters[index].secret;
					
				logger.write('Finished DBSync: '+JSON.stringify(userAuth),'user-auth.js');
			}													
		});			
	});
}

function applyFilter(routesObj,request,response)
{
	var
	filterObj = routesObj,
	path = request.method + url.parse(request.url).pathname,
	authHeader = request.headers['authorization'],
	authorized = false;
	
	logger.write('Auth header is= '+JSON.stringify(authHeader),'user-auth.js');	
	logger.write('User-Auth memory variable is: '+JSON.stringify(userAuth),'user-auth.js');
	
	if(authHeader != undefined)
	{
		var
		decodedauthHeader = new Buffer(authHeader.split(' ')[1],'base64').toString('ascii'),
		splitToken = decodedauthHeader.split(':'),
		email = splitToken[0],
		secret = splitToken[1];
		
		logger.write('email='+email+'\nsecret='+secret+'\nobj secret='+userAuth[email],'user-auth.js');
		
		if(userAuth[email] === secret)
		{
			//when auth is successfull
			filterObj.filterMessage = 'Allowed: User-Authentication is Successfull!';
			filterObj.filterStatus = 200;
			
			authorized = true;												
		}										
	}
	
	if(!authorized)
	{
		//when auth details are not specified
		filterObj.filterMessage = 'Forbidden: User-Authentication Failed/Details Invalid!';
		filterObj.filterStatus = 401;
	}
	
	//To keep in Sync with DB after processing each request
	userAuth = {};
	ReadFromDB();
	
	return filterObj;
		
}

//Populate on load, when loaded for first time, during server start
//ReadFromDB();

exports.applyFilter = applyFilter;
