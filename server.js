var http = require('http');
var path = require('path');
var ejs = require('ejs');
var socketio = require('socket.io');
var express = require('express');


var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
var totalusers = 0;


router.set("view engine", "ejs");
router.use(express.static("public"));



var cursors = {
  'cursors': []
};

router.use(express.static(path.resolve(__dirname, 'client')));


io.on('connection', function(socket) {


  socket.on('clientEvent', function(data) {//when it connects
    console.log("we got one!")
    socket.emit('setusernum', {'totalusers': totalusers});//give client a usernum
    
    //make up rgb values
    var r = Math.floor(Math.random() * (255));
    var g = Math.floor(Math.random() * (255));
    var b = Math.floor(Math.random() * (255));

    socket.emit("colorset", {'r': r,'g': g, 'b': b });//send rgb values to client

    cursors.cursors = new Array(totalusers + 1);
    totalusers++;
  });
  socket.on('cursor', function(data) {//when server receives update on cursor...
    cursors.cursors[data.usernum] = (new Point(data.x, data.y, data.usernum, data.r, data.g, data.b));//
    // cursors.cursors.push(new Point(data.x, data.y));
  });
  socket.on('removeCursor', function(data) {//when server receives update on cursor...
    cursors.cursors[data.usernum] = (null);//
    // cursors.cursors.push(new Point(data.x, data.y));
  });
});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});



function myFunction() {
  setTimeout(function() {
    io.sockets.emit('broadcast', cursors);
    myFunction();
  }, 100);
}
function clearAll() {
    setTimeout(function() {
      cursors.cursors = [];
      clearAll();
    }, 147483647);
  }


function Point(x, y, u, r, g, b) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.g = g;
  this.b = b;
  this.usernum = u;
}

myFunction();

router.get("/", function(req, res){
    res.render("index");
});