var respond = require('../controllers/respond');

function render(__response,__dataObj){
var outputstr='';
outputstr=outputstr+'<html> <body> ';

var i;
for(i=0;i<200;i++){ 
outputstr=outputstr+' this is a test iteration  ';
 
} 
outputstr=outputstr+' </body> </html> ';
respond.createResponse(__response,200,{'Content-Type': 'text/html'},outputstr);
} 

exports.render = render;