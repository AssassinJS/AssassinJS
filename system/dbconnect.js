var mongodb = require('mongodb');

function MyMongo(host, port, dbname) {
    this.host = host;
    this.port = port;
    this.dbname = dbname;

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
                console.log(err);
                return;
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

MyMongo.prototype.query = function(collectionName, callback) {
    if (this.db != undefined) {
        var collection = new mongodb.Collection(this.db, collectionName);
        callback(collection);
        return;
    }
    this.queue.push({ "cn" : collectionName, "cb" : callback});
}
