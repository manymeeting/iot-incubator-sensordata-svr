var express = require("express");
var bodyParser = require("body-parser");
var app = express();

// Memory storage
const memStorage = {
	sensorData: {
		ntc: "23.2",
		dht: "12.3"
	},
	targetTemperature: "",
	isMotionDetected: false,
	cameraImgPath: "https://media.chevrolet.com/content/Pages/news/us/en/2017/nov/1112-corvette/_jcr_content/top_parsys/image_1613279304.img.jpg/1510780124493.jpg"
};


// UDP Server
const PORT = 6868;
const HOST = "10.50.0.127";

var dgram = require('dgram');
var udpServer = dgram.createSocket('udp4');

udpServer.on('listening', function () {
    var address = udpServer.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

udpServer.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
    // Parse message
    message = message.toString();
    if(message === "Test") {

    	udpServer.send(Buffer.from('Test reply from server'), remote.port, remote.address, (err) => {
    		console.log(err);
    	});
    }
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
	Return current sensor data 
*/
app.get("/sensor/data", (req, res, next) => {
	res.jsonp(memStorage.sensorData);

});

/**
	Return a path to the latest camera image 
*/
app.get("/cam/image", (req, res, next) => {
	res.jsonp(memStorage.cameraImgPath);
});



/**
	Motion detected
*/
app.post("/motion", (req, res, next) => {
 	console.log(req.body);
 	memStorage.isMotionDetected = true;
 	res.send("New motion, got it");
});

/**
	Camera sent an image url
*/
app.post("/cam/image", (req, res, next) => {
 	console.log(req.body);
 	memStorage.cameraImgPath = req.body["imgPath"];
 	res.send("New image, got it");
});