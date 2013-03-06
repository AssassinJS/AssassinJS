/* logger.js
 ***** Part of AssassinJS *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that logs actions when called

*/

var fs = require('fs');

function write(data)
{
	var entry = 'Time: '+new Date()+'\n\tMessage: '+data+'\n';
	fs.appendFile('./system/log.txt',entry,function(err){
		if(err){console.log('Log NOT Appended with data:\n\t'+entry);}
		else{console.log('Log Appended with data:\n\t'+entry);}
	});
}

exports.write = write;
