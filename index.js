
"use strict"; // Must always be the first line.

//Required for Sphero.
var sphero = require("sphero");
var conf = require("./config.json");
var orb = sphero(conf.deviceName);
//Required for server.
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);


console.log("Starting spheroproject");

server.listen(conf.port);
//File of public, handed over to visitor.
app.configure(function(){
   app.use(express.static(__dirname + "/public")); 
});
app.get("/", function (req, res) {
  res.sendfile(__dirname + "/public/index.html");
});

//Belongs to the websocket.
io.sockets.on("connection", function (socket) {
  //Client connected.
});

//Set color to blue when connected to BT.
orb.connect(function() {
   orb.color("#0404B4"); //blue

   setTimeout(function(){
        orb.getPowerState(function(err, data) {
          if (err) {
            console.log("error: ", err);
          } else {
            io.sockets.emit("updateBattery", data);
            console.log("data:");
            console.log("  recVer:", data.recVer);
            console.log("  batteryState:", data.batteryState);
            console.log("  batteryVoltage:", data.batteryVoltage);
            console.log("  chargeCount:", data.chargeCount);
            console.log("  secondsSinceCharge:", data.secondsSinceCharge);
          }


          //Calibration of Sphero - All other things that Sphero should do after
          //Calibration need to be entered here!
          orb.startCalibration();
          setTimeout(function() {
            orb.finishCalibration();
            orb.color("FF00FF"); //magenta


            //Streaming of IMU (inertial measurment unit) data
            orb.streamImuAngles(7,false);
            orb.on("imuAngles", function(data) {
              io.sockets.emit("updateImu", data);
            });

            //Collision detection
             function updateColor(){
               orb.color("FF00FF"); //magenta
              }

            orb.detectCollisions(); 
            orb.on("collision",function(data){
                orb.startCalibration();
                io.sockets.emit("isCalibrating",true);
                setTimeout(function() {
                  orb.finishCalibration();
                  io.sockets.emit("isCalibrating",false);
                  updateColor();        
                },5000);
                io.sockets.emit("singleTap", data);   
            });
          }, 10000); //10s
      });
    },5000); //5s
  });//orb.connect
 



