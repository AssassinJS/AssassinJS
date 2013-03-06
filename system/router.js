/* router.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that maps the request URL's to those in the routes.txt file

*/

var url = require('url');
var $ = require('jquery');
var controller = require('../controllers/controller');
var config = require('./config');
var logger = require('./logger');

function route(request,response)
{			
	var routes = config.getRoutes();
	var reqDetails = url.parse(request.url);
	logger.write("Request Details: "+JSON.stringify(reqDetails));
	var filepath = reqDetails.pathname;
	
	controller.handleRequest(routes[filepath],request,response);
	
}

exports.route = route
