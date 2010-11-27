var path = require('path');
var http = require('http');
var url = require('url');
var fs = require('fs');
var querystring = require('querystring');

var database = function() {
    try {
        console.log("Reading database");
        return JSON.parse(fs.readFileSync("database.json"));
    }
    catch (e) {
        console.log("Reading database failed (" + e + ").  Initializing new");
        return {};
    }
}();

process.on('exit', function() {
    console.log("Writing database");
    fs.writeFileSync("database.json", JSON.stringify(database));
}); 

process.on('SIGINT', process.exit);
process.on('SIGTERM', process.exit);

var commands = {
    store: function(req) {
        database[req.row.id] = req.row;
        return {};
    },
    dump: function(req) {
        return database;
    },    
};

function errorOut(res, msg) {
    res.writeHead(500, {'Content-type': 'text/plain'});
    res.end(msg);
}

http.createServer(function (req, res) {
    console.log("Got URL: " + req.url);
    
    var match = /^\/(\w+)\?(.*)/.exec(req.url);
    if (match) {
        var req = querystring.parse(match[2]);
        var cmd = commands[match[1]];
        if (cmd) {
            var ret = cmd(req);
            res.writeHead(200, {'Content-type': 'text/javascript'});
            res.end(req.callback + "(" + JSON.stringify(ret) + ")");
        }
        else {
            errorOut(res, "Invalid command");
        }
    }
    else {
        errorOut(res, "Invalid URL");
    }
}).listen(8080, '0.0.0.0');
