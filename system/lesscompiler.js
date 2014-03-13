/* lesscompiler.js
 ***** Part of AssassinJS - NSP *****
  - (c)2013 Adithya and Sai Teja under MIT (Open Source) License
  
 This is the file that compiles the *.less files to *.css

*/

var fs = require('fs');
var less = require('less');
var LessParser = less.Parser;
var logger = require('./logger');
var rfs = require('./recursiveFS');

var lessFiles = [];

var fileDir = 'public';
var noCompileDir = 'lessBlocks';

//Dynamically Reading the public folder to get all the less files
function readLess(callback)
{
	
	//getFileList is the function with parameters as follows
	//first parameter is directory to read
	//second parameter is default directory, true removes the parent dir from each entry in the list
	//third parameter is the file extension to read in the list
	lessFiles = rfs.getFileList(fileDir,true,'less');
	compileLess();
	callback();
	return;
}

function compileLess()
{
	for(file in lessFiles)
	{
		var ext = lessFiles[file].split('.').pop();
		if(ext.toLowerCase() == 'less')
		{
			compileLessFile(lessFiles[file]);
			watchLess(lessFiles[file]);
		}
	}
}

function compileLessFile(filename)
{
	if(filename.indexOf(noCompileDir)>=0)
	{
		logger.write("not compiled "+filename,'lesscompiler.js');
		return;
	}
	var lessExtensionReg = new RegExp('.less$');
	
	var lessdata = fs.readFileSync(fileDir+'/'+filename,'utf-8').toString();
	
	lessParser = new LessParser({
		paths: [ './'+fileDir ],
		filename: filename
	});
	
	lessParser.parse(lessdata, function(err, tree){
		if(err)
			logger.write('Error compiling less to css file '+filename+'  '+err,'lesscompiler.js');
		fs.writeFile(fileDir+'/'+filename.replace(lessExtensionReg,'.css'),tree.toCSS(),function(err){
			if(err)
				logger.write('file write error for less to css file '+filename,'lesscompiler.js');
		});
	});
}

function watchLess(filename)
{
	fs.watchFile('public/'+filename,{persistent: true, interval: 500 },function (curr, prev) {
		if(curr.mtime != prev.mtime)
		{
			compileLessFile(filename);
			logger.write("called compileLessFile again for "+filename,'lesscompiler.js');
		}
	});
}

exports.readLess = readLess;
exports.compileLess = compileLess;
