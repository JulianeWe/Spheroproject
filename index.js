
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
   orb.color("#0404B4"); //Blue

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
            orb.color("FF00FF"); //Blue


            //Streaming of IMU (inertial measurment unit) data
            orb.streamImuAngles(7,false);
            orb.on("imuAngles", function(data) {
              io.sockets.emit("updateImu", data);
            });

            //Collision detection
            var lastTapTime = 0;
            orb.detectCollisions(); 
            orb.on("collision",function(data){
              if (new Date().getTime() - lastTapTime < 1500){
                io.sockets.emit("doubleTap", data);
                lastTapTime = 0;
              } else {
                io.sockets.emit("singleTap", data);
                lastTapTime = new Date().getTime();
              }
              /*io.sockets.emit("singleTap", data);
              console.log("collision detected");
                orb.color("red");
                 setTimeout(function(){
                  orb.color("FF00FF"); //Blue
                },1000);//1s wait till next reset*/
            });
            
            // shake with calibration 
             /*orb.streamAccelerometer();
             orb.on("accelerometer", function(data){
               var wert =Math.sqrt(Math.pow(data.xAccel.value[0],2) 
                    + Math.pow(data.yAccel.value[0],2)
                    + Math.pow(data.zAccel.value[0],2) );
               if (wert > 10000 )
                              {
                                orb.startCalibration();
                                  setTimeout(function() {
                                    orb.finishCalibration();
                                    console.log("finished calibration")
                                  },5000);
                              }
             });*/

             

          }, 10000); //10s
      });

    },10000); //10s

  });//orb.connect
 



