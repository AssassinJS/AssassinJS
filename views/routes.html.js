var respond = require('../controllers/respond');

function render(__response,__dataObj){
var outputstr='';
outputstr=outputstr+'<html> <head> <link rel="stylesheet" href="index_style.css" type="text/css" /> </head> <body>  <div id="bodyWrapper">  <div id="headerWrapper"> <div id="headerContent"> Assassin.js </div> </div> <div id="contentWrapper">  <div id="contentLeft"> <div id="projectMenu"> Configure Project Routes<br /> Configure Filters<br /> </div> </div> <div id="contentRight"> Manage Routes Here<br /> </div>  </div> <div id="footerWrapper"> <div id="footerContent"> (c)2013 Adithya Chebiyyam and Sai Teja Jammalamadaka </div> </div>  </div>  </body> </html> ';
respond.createResponse(__response,200,{'Content-Type': 'text/html'},outputstr);
} 

exports.render = render;