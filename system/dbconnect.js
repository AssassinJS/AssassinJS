var mongodb = require('mongodb');
var logger = require('./logger');

var configObj = require('../config/config.json');

function MyMongo(host, port, dbname) {

	this.useDB = configObj.useDB;
	if(process.env.VCAP_SERVICES){
		var env = JSON.parse(process.env.VCAP_SERVICES);
		var mongoInstance = env['mongodb-2.0'][0]['credentials'];
		this.host = mongoInstance.hostname;
		this.port = mongoInstance.port;
		this.dbname = mongoInstance.db;
		this.username = mongoInstance.username;
		this.password = mongoInstance.password;
	}
	else
	{
		this.host = host;
		this.port = port;
		this.dbname = dbname;
	}

    this.server = new mongodb.Server(
                              this.host, 
                              this.port, 
                              {auto_reconnect: true});
    this.db_connector = new mongodb.Db(this.dbname, this.server,{w:1});

    var self = this;

    this.db = undefined;
    this.queue = [];

    this.db_connector.open(function(err, db) {
        if( err ) {
            console.log('no db running: '+err);
            return;
        }
		if(self.username && self.password)
		{
			db.authenticate(self.username, self.password, function(err,res){
				if( err)
				{
					console.log(err);
					return;
				}
				console.log(res);
			});
		}
		self.db = db;
        for (var i = 0; i < self.queue.length; i++) {
            var collection = new mongodb.Collection(
                                 self.db, self.queue[i].cn);
            self.queue[i].cb(collection);
        }
        self.queue = [];

    });
}
exports.MyMongo = MyMongo;
exports.reloadrqm = reloadrqm;

MyMongo.prototype.query = function(collectionName, callback) {
    if (this.db != undefined) {
        var collection = new mongodb.Collection(this.db, collectionName);
        callback(collection);
        return;
    }
    this.queue.push({ "cn" : collectionName, "cb" : callback});
}

function reloadrqm(rqm)
{
logger.reloadrqm(rqm);
logger = rqm.system.logger;
}
