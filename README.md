# IoT Incubator - Sensor Data Server
This server project is part of the whole IoT Incubator project. We built a temperate box platform with a bunch of sensors, cameras and a heat bed. This temperate box can be used as a smart incubator. Users are able to control it through web pages or mobile apps. 

## Design
This server talks with computing units on the hardware platform (Arduino and Raspberry Pi) to collect sensor data and camera data. Meanwhile, the dashboard also talks to this server to get most recent data. The reason why we put two services into one server is that we want to simplify the architecture while support real-time data rendering. By storing data in memory instead of a separate database, the whole system works pretty efficient.

## Dependencies
- This server is built on Node.js
- Express library is required

## Features
- Server uses UDP to collect data from sensors
- Server listens on a pre-defined port for UDP connection
- Server offers a group of REST style APIs for data querying

## How to Run

 1. Go to the root directory for this project
 2. run `npm install`
 3. run `node index.js`
