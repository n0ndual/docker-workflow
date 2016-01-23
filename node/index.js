var express = require('express'),
    http = require('http'),
    redis = require('redis');

var app = express();

console.log(process.env.REDIS_PORT_6379_TCP_ADDR + ':' + process.env.REDIS_PORT_6379_TCP_PORT);

// APPROACH 1: Using environment variables created by Docker
//var client = redis.createClient(
// 	process.env.REDIS_PORT_6379_TCP_PORT,
//   	process.env.REDIS_PORT_6379_TCP_ADDR
//);

// APPROACH 2: Using host entries created by Docker in /etc/hosts (RECOMMENDED)
var client1 = redis.createClient('6379', 'redis1');
var client2 = redis.createClient('6379', 'redis2');


app.get('/', function(req, res, next) {
    ip = 'Dear friend from ' + req.query.ip +", Welcome to CDS GPN!\n";
    if(req.query.ip=="US")  {
	client1.incr('counter', function(err, counter) {
	    if(err) return next(err);
	    res.send(ip + 'This page has been viewed ' + counter + ' times!');
	});	
    }else{
	client2.incr('counter', function(err, counter) {
	    if(err) return next(err);
	    res.send(ip + 'This page has been viewed ' + counter + ' times!');
	});
    };
});

http.createServer(app).listen(process.env.PORT || 8080, function() {
  console.log('Listening on port ' + (process.env.PORT || 8080));
});
