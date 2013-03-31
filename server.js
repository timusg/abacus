var express = require('express'),
path = require('path'),
http = require('http'),
io = require('socket.io'),
redis = require("redis");

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser())
  app.use(express.static(path.join(__dirname, 'public')));
});

var server = http.createServer(app);
io = io.listen(server);

app.setMaxListeners(0);
io.setMaxListeners(0);


var redis_client  = redis.createClient(6379,"127.0.0.1");

io.configure(function () {
  io.set('authorization', function (handshakeData, callback) {
    if (handshakeData.xdomain) {
      callback('Cross-domain connections are not allowed');
    } else {
      callback(null, true);
    }
  });
});

server.listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection', function(socket) {
  redis_client.psubscribe("metric:counters");
  try {
    redis_client.on("pmessage", function(pattern, channel, message) {
      socket.emit('counters', { channel: channel, data: message });
    });
  } catch(e) {
  }
});
