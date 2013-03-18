var fs = require('fs');
var logger = require('../system/logger');

var JSSPFiles = [];

//Dynamically Reading the jssp folder to get all the jssp files
//readJSSP();//Ensures first time execution
function readJSSP()
{
	JSSPFiles = fs.readdirSync('./JSSP/');
	compileJSSP();
}

function compileJSSP()
{
	var JSSPExtensionReg = new RegExp('.jssp$');
	var EqualReg = new RegExp('^=');
	for(file in JSSPFiles)
	{
		compileJSSPFile('./JSSP/'+JSSPFiles[file]);
		watchJSSP('./JSSP/'+JSSPFiles[file]);
	}
}

function compileJSSPFile(filename)
{
	var JSSPExtensionReg = new RegExp('.jssp$');
	var EqualReg = new RegExp('^=');
	var compiledCode = "var respond = require('../controllers/respond');\r\n\r\nfunction render(__response,__dataObj){\r\nvar outputstr='';\r\n";
	var filedata = fs.readFileSync(filename,'utf-8').toString();
	if(filedata!=null || filedata!=undefined)
	{
		var viewFile = JSSPFiles[file].split(JSSPExtensionReg)[0];
		
		var startTagSplit = filedata.split('<$');
		for(line in startTagSplit)
		{
			if(startTagSplit[line].indexOf('$>')!=-1)
			{
				var endTagSplit = startTagSplit[line].split('$>');
				if(endTagSplit[0] != null || endTagSplit[0] != undefined)
					compiledCode = compiledCode+endTagSplit[0];
				if(endTagSplit[1] != null || endTagSplit[1] != undefined)
					compiledCode = compiledCode+"outputstr=outputstr+'"+endTagSplit[1].replace(/\r/g,"").replace(/\n/g," ").replace('\'','\\\'')+"';\r\n";
			}
			else
			{
				compiledCode = compiledCode+"outputstr=outputstr+'"+startTagSplit[line].replace(/\r/g,"").replace(/\n/g," ").replace('\'','\\\'')+"';\r\n";
			}
		}
	}
	compiledCode = compiledCode+"respond.createResponse(__response,200,{'Content-Type': 'text/html'},outputstr);\r\n} \r\n\r\nexports.render = render;";
	fs.writeFile('./views/'+viewFile+'.js',compiledCode,function(err){
		if(err)
			logger.write('file write error for view file '+viewFile,'viewcompiler.js');
		//else
			//logger.write('file write successful for view file '+viewFile,'viewcompiler.js');
	});
}

function watchJSSP(filename)
{
	fs.watchFile(filename,{persistent: true, interval: 1000 },function (curr, prev) {
		console.log('the current mtime is: ' + curr.mtime);
		console.log('the previous mtime was: ' + prev.mtime);
		if(curr.mtime != prev.mtime)
			compileJSSPFile(filename);
	});
}

exports.readJSSP = readJSSP;
exports.compileJSSP = compileJSSP;
