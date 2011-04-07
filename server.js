var sys = require('sys');
var path = require('path');
var http = require('http');
var https = require('https');
var url = require('url');
var fs = require('fs');
var querystring = require('querystring');

var credentials = function() {
    return JSON.parse(fs.readFileSync("api-keys"));
}();

var database = function() {
    try {
        console.log("Reading database");
        return JSON.parse(fs.readFileSync("database.json"));
    }
    catch (e) {
        console.log("Reading database failed (" + e + ").  Initializing new");
        return { rows: {}, globals: {} };
    }
}();

var writeDatabase = function () { 
    console.log("Writing database");
    fs.writeFileSync("database.json", JSON.stringify(database)); 
}

setInterval(writeDatabase, 60*60*1000);

process.on('exit', function() {
    writeDatabase();
}); 

process.on('SIGINT', process.exit);
process.on('SIGTERM', process.exit);
process.on('SIGHUP', writeDatabase);

var merge = function(a,b) {
    var r = {};
    for (var k in a) { r[k] = a[k] }
    for (var k in b) { r[k] = b[k] }
    return r;
}

var commands = {
    store_row: function(req, cc) {
        database.rows[req.row.id] = req.row;
        cc({});
    },
    store_global: function(req, cc) {
        database.globals[req.id] = req.value;
        cc({});
    },
    fetch_global: function(req, cc) {
        cc(database.globals[req.id]);
    },
    dump: function(req, cc) {
        cc(database);
    },    
    get_paypal_transaction: function(input, cc) {
        var req = merge(credentials, {
            VERSION: '69.0',
            METHOD: 'GetTransactionDetails',
            TRANSACTIONID: input.transaction_id,
        });
        var query = querystring.stringify(req);
        var req = https.get({
            host: 'api-3t.paypal.com',
            port: 443,
            path: '/nvp?' + query,
        }, function(res) {
            res.on('data', function (chunk) {
                var parsed = querystring.parse(chunk.toString());
                cc(parsed);
            });
	}).on('error', function(e) {
            console.log("swallowing error: ", e);
            cc("ERROR " + e);
        }); 
    },
};


var errorOut = function (res, msg) {
    res.writeHead(500, {'Content-type': 'text/plain'});
    res.end(msg);
}

http.createServer(function (req, res) {
    console.log(new Date(), req.url);
    var match = /^\/(\w+)\?(.*)/.exec(req.url);
    if (match) {
        var req = querystring.parse(match[2]);
        var arg = JSON.parse(req.q);
        console.log("Arg: ", arg);
        var cmd = commands[match[1]];
        if (cmd) {
            cmd(arg, function (ret) {
                res.writeHead(200, {'Content-type': 'text/javascript'});
                res.end(req.callback + "(" + JSON.stringify(ret) + ")");
            });
        }
        else {
            errorOut(res, "Invalid command");
        }
    }
    else {
        errorOut(res, "Invalid URL");
    }
}).listen(8080, '0.0.0.0');
