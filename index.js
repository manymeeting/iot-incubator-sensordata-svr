var express = require("express");
var bodyParser = require("body-parser");
var app = express();

// Memory storage
const memStorage = {
	clientSocket: { // Port and address of incubator client (Arduino)
		port: {},
		address: {}
	},
	sensorData: {
		ntc: "0.0",
		dht: "0.0",
		hum: "0.0"
	},
	targetTemperature: "",
	motionAlert: "No motion detected.",
	cameraImgPath: "http://192.168.29.177/image/test.jpg"
};


// UDP Server
const PORT = 6868;
const HOST = "192.168.29.164";

const dgram = require('dgram');
const udpServer = dgram.createSocket('udp4');

udpServer.on('listening', function () {
    var address = udpServer.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

udpServer.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
    memStorage.clientSocket.port = remote.port;
    memStorage.clientSocket.address = remote.address;
    
    // Parse message
    message = message.toString();
    if(message === "Test") { // Test message

    	udpServer.send(Buffer.from('Test reply from server'), remote.port, remote.address, (err) => {
    		console.log(err);
    	});
    }
    else if(message.substring(0, 3) === "Hum") { 
    	// Sensor data i.e. "Hum:11.11,Temp:22.22,Analog:33.33,TargetTemp:44.44"
    	let dataPairs = message.split(",");
    	let humidity = dataPairs[0].split(":").pop();
    	let dhtTemp = dataPairs[1].split(":").pop();
    	let ntcTemp = dataPairs[2].split(":").pop();

    	memStorage.sensorData.ntc = ntcTemp.substring(0,6); // Keep first 6 digits
    	memStorage.sensorData.dht = dhtTemp.substring(0,6);
    	memStorage.sensorData.hum = humidity.substring(0,6);
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
	Return the latest motion alert 
*/
app.get("/motion", (req, res, next) => {
	res.jsonp(memStorage.motionAlert);
});


/**
	Set new target temperature for incubator (Using GET for CORS purpose) 
*/
app.get("/incubator/target-temperature", (req, res, next) => {
	let newTargetTemp = req.query["newTargetTemp"];
	newTargetTemp =  myUtils.formatTemperature(newTargetTemp); // Unify the length of data

	memStorage.targetTemperature = newTargetTemp;
	console.log(`User set target temperature to ${newTargetTemp} celsius.`);

	// Send UDP packet with new target data to Arduino
	udpServer.send(
		Buffer.from("targetTemp:" + newTargetTemp), 
		memStorage.clientSocket.port, memStorage.clientSocket.address, 
		(err) => {
			console.log(err);
		}
	);

	res.jsonp("New target temperature received");
});

/**
	Motion detected
*/
app.post("/motion", (req, res, next) => {
 	console.log(req.body);
 	let currTime = new Date();
	let formattedTime = currTime.getFullYear() + "-" + (currTime.getMonth() + 1) 
		+ "-" + currTime.getDate() + " " + currTime.getHours() + ":" + currTime.getMinutes() + ":" + currTime.getSeconds();
	
 	memStorage.motionAlert = "Latest motion: " + formattedTime;
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

const myUtils = {};
/**
	Format the temperature like 00.00
*/
myUtils.formatTemperature = function(rawTemp) {
	const maxTemp = "99.99";
	
	if(rawTemp.split(".").length > 2) return "NaN"; // Invalid

	if(!rawTemp.includes(".")) {
		if(rawTemp.length >= 3) return maxTemp;

		rawTemp = parseInt(rawTemp) < 10 ? "0" + rawTemp  :  rawTemp;
    	return rawTemp + ".00";
	}
	else {
	    let intPart = rawTemp.split(".").shift(); 
	    intPart = parseInt(intPart); 
	    intPart = intPart < 10 ? "0" + intPart : intPart + "";

		let fracPart = rawTemp.split(".").pop(); 
		fracPart = parseInt(fracPart); 
		fracPart = fracPart < 10 ? fracPart + "0" : fracPart + "";

		return intPart + "." + fracPart.substring(0, 2);
	}
}