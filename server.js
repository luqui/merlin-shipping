var path = require('path');
var http = require('http');
var url = require('url');
var fs = require('fs');
var querystring = require('querystring');

var database = {};

http.createServer(function (req, res) {
    console.log("Got URL: " + req.url);
    var storeRow = /store\?(.*)/.exec(req.url);
    if (storeRow) {
        var storeReq = querystring.parse(storeRow[1]);
        console.log("Req = " + JSON.stringify(storeReq));
        database[storeReq.row.id] = storeReq.row;
        res.writeHead(200, {'Content-type': 'text/plain'});
        res.end('Received transaction');
        return;
    }
}).listen(8080, '0.0.0.0');
