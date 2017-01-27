"use strict";

// Client.js gets the data from Websocket-Server which has got the data of the Sphero
// Client.js will show those data in a browser.

$(document).ready(function(){
    var socket = io.connect();

var svg = d3.select("svg");
svg.append("rect").attr("width", 10).attr("height",50).attr("x",50).attr("y",250);
svg.append("rect").attr("width", 10).attr("height",50).attr("x",150).attr("y",250);
svg.append("rect").attr("width", 10).attr("height",50).attr("x",250).attr("y",250);



    socket.on("updateBattery", function(data){
    //console.log(data);
    $("#Battery").text(data.batteryState);
    });

    socket.on("updateGyro", function(data) {
        //console.log(data);
        $("#xGyro").text("x:" + data.xGyro.value[0]);
        $("#yGyro").text("y:" + data.yGyro.value[0]);
        $("#zGyro").text("z:" + data.zGyro.value[0]);
    });

    socket.on("updateImu", function(data) {
        //console.log(data);
        $("#pitch").text("Pitch:" + data.pitchAngle.value[0] + "°");
        $("#roll").text("Roll:" + data.rollAngle.value[0] + "°");
        $("#yaw").text("Yaw:" + data.yawAngle.value[0] + "°");
        
        var dataArray=[data.pitchAngle.value[0],data.rollAngle.value[0],data.yawAngle.value[0]];

        //Transform the data from dataArray into useful stuff for svg objects.
        svg.selectAll("rect")
            .data(dataArray)
            .enter();
        svg.selectAll("rect").attr("y",function(d){return d + 180;});

        
    });





});

