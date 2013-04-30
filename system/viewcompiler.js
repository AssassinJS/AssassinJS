var fs = require('fs');
var logger = require('../system/logger');

var JSSPFiles = [];

//Dynamically Reading the jssp folder to get all the jssp files
//readJSSP();//Ensures first time execution
function readJSSP(callback)
{
	JSSPFiles = fs.readdirSync('./JSSP/');
	compileJSSP();
	callback();
	return;
}

function compileJSSP()
{
	var JSSPExtensionReg = new RegExp('.jssp$');
	var EqualReg = new RegExp('^=');
	for(file in JSSPFiles)
	{
		compileJSSPFile(JSSPFiles[file]);
		watchJSSP(JSSPFiles[file]);
	}
}

function compileJSSPFile(filename)
{
	var JSSPExtensionReg = new RegExp('.jssp$');
	var EqualReg = new RegExp('^=');
	var globalCode = '';
	var compiledCode = "var respond = require('../controllers/respond');\r\n\r\nfunction render(__request,__response,__dataObj){\r\nvar outputstr='';\r\n";
	var filedata = fs.readFileSync('./JSSP/'+filename,'utf-8').toString();
	//logger.write('view contents '+filedata,'viewcompiler');
	if(filedata!=null || filedata!=undefined)
	{
		var viewFile = filename.split(JSSPExtensionReg)[0];
		
		var startTagSplit = filedata.split('<$');
		for(line in startTagSplit)
		{
			if(startTagSplit[line].indexOf('$>')!=-1)
			{
				var endTagSplit = startTagSplit[line].split('$>');
				if(endTagSplit[0] != null && endTagSplit[0] != undefined)
				{
					if((/^=/).test(endTagSplit[0]))
					{
						compiledCode = compiledCode+"var expression"+endTagSplit[0]+";\r\n\t";
						compiledCode = compiledCode+"outputstr=outputstr+expression;\r\n";
					}
					else if((/^@/).test(endTagSplit[0]))
					{
						globalCode = globalCode+endTagSplit[0];
					}
					else
						compiledCode = compiledCode+endTagSplit[0];
				}
				if(endTagSplit[1] != null && endTagSplit[1] != undefined && endTagSplit[1] != '')
					compiledCode = compiledCode+"outputstr=outputstr+'"+endTagSplit[1].replace(/\r/g,"").replace(/\n/g," ").replace('\'','\\\'')+"';\r\n";
			}
			else
			{
				compiledCode = compiledCode+"outputstr=outputstr+'"+startTagSplit[line].replace(/\r/g,"").replace(/\n/g," ").replace('\'','\\\'')+"';\r\n";
			}
		}
	}
	compiledCode = compiledCode+"respond.createResponse(__response,200,{'Content-Type': 'text/html'},outputstr);\r\n/**/} \r\n\r\nexports.render = render;";
	fs.writeFile('./compiled_views/'+viewFile+'.jssp.js',globalCode+compiledCode,function(err){
		if(err)
			logger.write('file write error for view file '+viewFile,'viewcompiler.js');
		//else
			//logger.write('file write successful for view file '+viewFile,'viewcompiler.js');
	});
}

function watchJSSP(filename)
{
	fs.watchFile('./JSSP/'+filename,{persistent: true, interval: 1000 },function (curr, prev) {
		//logger.write('the current mtime is: ' + curr.mtime,'viewcompiler.js');
		//logger.write('the previous mtime was: ' + prev.mtime,'viewcompiler.js');
		if(curr.mtime != prev.mtime)
		{
			compileJSSPFile(filename);
			logger.write("called compileJSSPFile again for "+filename,'viewcompiler.js');
		}
	});
}

exports.readJSSP = readJSSP;
exports.compileJSSP = compileJSSP;
