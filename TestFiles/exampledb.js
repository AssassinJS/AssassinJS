var MongoClient = require('mongodb').MongoClient;
var $ = require('jquery');

MongoClient.connect("mongodb://localhost:27017/mydb",function(err,db){
	if(err){
		console.log("Connection Error! ");
	}
	
	db.createCollection('nodeThings',{w:1},function(err,collection){
		if(err){
			console.log("Collection Creation Error!\n\t(or)\nCollection Already Exists!");
		}
	});
	
	var collection = db.collection('nodeThings');
	var collection2 = db.collection('things');
	var doc1 = {'test':'two'};
	
	collection.insert(doc1,function(err,result){
		if(err){
			console.log("Insertion Failed!");
		}
		console.log("Insertion Completed :)");
	});
	
	collection2.find().toArray(function(err,items){
		$(items).each(function(){
			//console.log("Item: "+JSON.stringify(this));
			if(this.x!=null) console.log("x = "+this.x+"\tj = "+this.j);
		});
		//console.log("Collection things contains: "+JSON.stringify(items));
	});
	
});
