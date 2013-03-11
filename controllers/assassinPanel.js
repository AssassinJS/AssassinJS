/* assassinPanel.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is a default controller that invokes the assassinPanel UI

*/

var fileserver = require('./fileserver');


function invoke(req,res)
{
	//First need to check of user validation credentials.
	//If valid user, then show home page
	//else redirect to login index page
	fileserver.serveFile(req,res,'assassinPanel');
}

exports.invoke = invoke;
