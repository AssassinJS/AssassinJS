var respond = require('../controllers/respond');

function render(__request,__response,__dataObj){
var outputstr='';
outputstr=outputstr+'<html> <head> <link rel="stylesheet" href="index_style.css" type="text/css" /> </head> <body>  <div id="bodyWrapper">  <div id="headerWrapper"> <div id="headerContent"> Assassin.js </div> </div> <div id="contentWrapper"> <form method="POST" action="./useragentfiltersubmit.html"> <div id="contentLeft"> <div id="projectMenu" style="position:fixed;"> Configure Project Routes<br /> Configure Filters<br /> <input type="submit" value="Save Changes to Filter User Agent" /> </div> </div> <div id="contentRight"> Manage User Agent Filters for Routes Here<br /><br /> ';

var userAgentFilterParameters = __dataObj["filterDB"]["user-agent"];
var routesList = __dataObj["routesDB"];
outputstr=outputstr+'  Total List of Routes<br /> <div style="color:black; background-color:white;"> <table border="1" cellspacing="0" style="width:100%"> 	<tr> 		<th>Apply<br /><input type="checkbox" id="routesToggle" onclick="toggle(this)"></th> 		<th>Select Routes to Apply User-Agent Filter</th> 	</tr> 	';

	for(var x in routesList)
	{
	outputstr=outputstr+' 	<tr> 		<td style="text-align: center;"><input type="checkbox" name="routes" value="';
var expression=routesList[x].regexp;
	outputstr=outputstr+expression;
outputstr=outputstr+'"></td> 		<td>';
var expression=routesList[x].regexp;
	outputstr=outputstr+expression;
outputstr=outputstr+'</td> 	</tr> ';

}
outputstr=outputstr+' </table> </div>  Total List of User Agents<br /> <div style="color:black; background-color:white;"> <table border="1" cellspacing="0"> 	<tr> 		<th>BlackList<br /><input type="checkbox" id="useragentBlackToggle" onclick="toggle(this)"></th> 		<th>WhiteList<br /><input type="checkbox" id="useragentWhiteToggle" onclick="toggle(this)"></th> 		<th>UserAgent</th> 	</tr> 	';

	for(var x in userAgentFilterParameters.total)
	{
	outputstr=outputstr+' 	<tr> 		<td style="text-align: center;"><input type="checkbox" name="useragentBlack" value="';
var expression=userAgentFilterParameters.total[x];
	outputstr=outputstr+expression;
outputstr=outputstr+'"></td> 		<td style="text-align: center;"><input type="checkbox" name="useragentWhite" value="';
var expression=userAgentFilterParameters.total[x];
	outputstr=outputstr+expression;
outputstr=outputstr+'"></td> 		<td>';
var expression=userAgentFilterParameters.total[x];
	outputstr=outputstr+expression;
outputstr=outputstr+'</td> 	</tr> ';

}
outputstr=outputstr+' </table> </div>   </div> </form> </div> <div id="footerWrapper"> <div id="footerContent"> (c)2013 Adithya Chebiyyam and Sai Teja Jammalamadaka </div> </div>  </div>  <script language="javascript"> function toggle(tag) { 	checkboxes = []; 	if(tag.id=="useragentBlackToggle") 	{ 		checkboxes = document.getElementsByName("useragentBlack"); 	} 	if(tag.id=="useragentWhiteToggle") 	{ 		checkboxes = document.getElementsByName("useragentWhite"); 	} 	if(tag.id=="routesToggle") 	{ 		checkboxes = document.getElementsByName("routes"); 	} 	for(var i in checkboxes) 		checkboxes[i].checked = tag.checked; } </script>  </body> </html> ';
respond.createResponse(__response,200,{'Content-Type': 'text/html'},outputstr);
/**/} 

exports.render = render;