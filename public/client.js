"use strict";

// Client.js gets the data from Websocket-Server which has got the data of the Sphero
// Client.js will show those data in a browser.

$(document).ready(function(){
    var initializeWebsocket = function (obj, cam){
	var socket = io.connect();
	var degreeToRadiant = 2*3.14 / 360;
	var zoomFactor = 0.02;
	var speedFactor = 0.8;
	var isCalibrating = false; 
	var invertedMode = false;
    socket.on("updateBattery", function(data){
    });
    socket.on("updateGyro", function(data) {
	});
	
	// Zoom: move Sphero forward/backward to zoom into object.
	// Rotate Sphero clockwise: rotates object clockwise.
	// If Sphero is not calibrating, code will be executed, else Sphero is calibrating and object will not move at all.
    socket.on("updateImu", function(data) { 
		if (!isCalibrating){
			if (invertedMode){
				cam.translateZ(data.yawAngle.value[0] * zoomFactor); 
				obj.rotateY(data.pitchAngle.value[0] * degreeToRadiant * speedFactor);
			} else {
				cam.translateZ(data.pitchAngle.value[0] * zoomFactor); 
				obj.rotateY(data.yawAngle.value[0] * degreeToRadiant * speedFactor);
			}
			if(cam.position.z < 0) {
				cam.position.z = 0
			};
    	}
	});

	//Single tap of Sphero resets object to its initial position.
	socket.on("singleTap", function(data) {
		console.log("Sphero single tapped - works");
	});

	//Double tap of Sphero for calibration.
	socket.on("doubleTap", function(data) {
		camera.position.z = 10;
		console.log("Sphero double tapped - works");
	});
	// Update wether Sphero is calibrating or not.
	socket.on("isCalibrating", function(data) {
		isCalibrating = data;
	});

	socket.on("setMode", function(data){
		invertedMode = data;
	});
	
}

	


    var container, stats;
			var camera, scene, renderer;
			var mouseX = 0, mouseY = 0;
			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;
			init();
			animate();
			function init() {
				container = document.createElement( 'div' );
				document.body.appendChild( container );
				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.z = 10;
				
				// scene
				scene = new THREE.Scene();
				var ambient = new THREE.AmbientLight( 0x444444 );
				scene.add( ambient );
				var directionalLight = new THREE.DirectionalLight( 0xffeedd );
				directionalLight.position.set( 0, 0, 1 ).normalize();
				scene.add( directionalLight );
				
				// model
				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};
				var onError = function ( xhr ) { };
				THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
				var mtlLoader = new THREE.MTLLoader();
					mtlLoader.setPath( 'OBJ_Format/' );
				mtlLoader.load( 'Animal_Cell_smooth.mtl', function( materials ) {
					materials.preload();
					var objLoader = new THREE.OBJLoader();
					objLoader.setMaterials( materials );
					objLoader.setPath( 'OBJ_Format/' );
					objLoader.load( 'Animal_Cell_smooth.obj', function ( object ) {
						//object.position.y = - 95;
						scene.add( object );

						initializeWebsocket(object, camera);

					}, onProgress, onError );
				});
				
				//
				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );
				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				
				//
				window.addEventListener( 'resize', onWindowResize, false );
			}
			
			function onWindowResize() {
				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}
			
			function onDocumentMouseMove( event ) {
				mouseX = ( event.clientX - windowHalfX ) / 2;
				mouseY = ( event.clientY - windowHalfY ) / 2;
			}
			
			
			function animate() {
				requestAnimationFrame( animate );
				render();
			}
			
			function render() {
				//camera.position.x += ( mouseX - camera.position.x ) * .05;
				//camera.position.y += ( - mouseY - camera.position.y ) * .05;
				camera.lookAt( scene.position );
				renderer.render( scene, camera );
			}






});

