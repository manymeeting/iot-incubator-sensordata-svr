var express = require("express");
var bodyParser = require("body-parser");
var app = express();



// UDP Server
const PORT = 6868;
const HOST = "127.0.0.1";

var dgram = require('dgram');
var udpServer = dgram.createSocket('udp4');

udpServer.on('listening', function () {
    var address = udpServer.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

udpServer.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
});

udpServer.bind(PORT, HOST);


// HTTP API Server

app.listen(3000, () => {
	console.log("Server running on port 3000");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
	Respond an array of size 10 with integer from 0 to 100 
*/ 
app.get("/test", (req, res, next) => {

	let arr = [];
	for(let i = 0; i < 10; i++) {
		arr.push(Math.floor(Math.random() * (100 - 0)));
	}
	// Use JSONP because client is supposed to run a static html page without any server. 
	// The domain of opened page will be "" so we have CORS situation. Use JSONP to handle this.  
	res.jsonp(arr);
});

/**
	Motion detected
*/
app.post("/motion", (req, res, next) => {
 	console.log(req.body);
 	res.send("New motion, got it");
});

/**
	Camera sent an image url
*/
app.post("/cam/images", (req, res, next) => {
 	console.log(req.body);
 	res.send("New image, got it");
});