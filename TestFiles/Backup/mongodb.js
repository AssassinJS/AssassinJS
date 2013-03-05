var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

MongoClient.connect('mongodb://localhost:27017/test',

	function(err,db)
	{
		if(err)		
			console.log(err);		
		else		
			console.log('Connected Successfully!');
		
		db.createCollection('testthings',{w:1}, 
			function(err,collection)
			{
				if(err)
					console.log(err);
				else
				    console.log('Successfully created testthings collection');
			}
		);
		
		var collection = db.collection('testthings');
		
		var list = [];
		
		for(var i=1;i<=20;i++)
		{
			list.push({name:'node',type:'js',using:'mongodb',num:i});			
		}
		
		collection.insert(list,{w:1},
			function(err,result)
			{
				if(err) console.log(err);
				else console.log(result);
			}
		);
		
		console.log(collection.find());
	}
);
