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

http.createServer(function (req, res) {
    console.log("Got URL: " + req.url);
    var storeRow = /store\?(.*)/.exec(req.url);
    if (storeRow) {
        var storeReq = querystring.parse(storeRow[1]);
        console.log("Req = " + JSON.stringify(storeReq));
        database[storeReq.row.id] = storeReq.row;
        res.writeHead(200, {'Content-type': 'text/javascript'});
        res.end(storeReq.callback + "(\"success\")");
        return;
    }
}).listen(8080, '0.0.0.0');
