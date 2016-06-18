// Copyright (c) 2016, Sebastien Sydney Robert Bigot
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those
// of the authors and should not be interpreted as representing official policies,
// either expressed or implied, of the FreeBSD Project.

///<reference path="typings/tsd.d.ts"/>

// Browserify will bundle shaders and js all together for us.
// In order to do so, the tool must find a 'require' with a string literal argument
// to figure out what must be bundled together
require('./shaders/noise.vs');
require('./shaders/noise_fbm.fs');
require('./shaders/noise_ridged.fs');

var renderer: THREE.WebGLRenderer;
var mesh: THREE.Mesh;
var camera: THREE.PerspectiveCamera;
var controls: THREE.OrbitControls;	

var app: ng.IModule = angular.module('Nebula.App', []);

window.onload = () => {

	var view = document.getElementById("nebula-view");

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio);

	camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	camera.position.z = 1.5;

	function doResize(): void {
		var w = view.offsetWidth, h = window.innerHeight - document.getElementById("header").offsetHeight;
		w *= 0.95;
		h *= 0.95;
		renderer.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	}
	doResize();
	window.addEventListener('resize', doResize);

	view.appendChild(renderer.domElement);

	var scene = new THREE.Scene();

	scene.add(camera);

	
	// var material =
	// 	new THREE.MeshPhongMaterial({
	// 		vertexColors: THREE.FaceColors,
	// 		side: THREE.DoubleSide,
	// 		shading: THREE.FlatShading
	// 	});		

	var permTexture = new THREE.DataTexture(
		<any>new ArrayBuffer(256 * 256 * 4),
		256,
		256,
		THREE.RGBAFormat,
		THREE.UnsignedByteType, null, null, null, null, null /*, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy*/);

	var gradTexture = new THREE.DataTexture(
		<any>new ArrayBuffer(256 * 1 * 3),
		256,
		1,
		THREE.RGBFormat,
		THREE.UnsignedByteType, null, null, null, null, null /*, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy*/);

	var material = new THREE.ShaderMaterial({

		uniforms: {
			permTexture: { value: permTexture, type: "t" },
			gradTexture: { value: gradTexture, type: "t" },
			ditherAmt: { value: 0.1, type: "f" },
			gain: { value: 0.1, type: "f" },
			innerColor: { value: new THREE.Vector3(19/255,34/255,1.0), type: "v3" },
			lacunarity: { value: 1.0, type: "f" },
			octaves: { value: 2, type: "i" },
			outerColor: { value: new THREE.Vector3(0,0,0), type: "v3" },
			powerAmt: { value: 1.0, type: "f" },
			shelfAmt: { value: 0.0, type: "f" },
			noiseScale: { value: 10.0, type: "f" }			
		},
		
		vertexShader: require('./shaders/noise.vs')(),
		fragmentShader: require('./shaders/noise_fbm.fs')()

	});

	mesh = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 1),
			material
		);

	scene.add(mesh);

	var ambientLight = new THREE.AmbientLight(0x000000);
	scene.add(ambientLight);

	var lights = [];
	lights[0] = new THREE.PointLight(0xffffff, 1, 0);
	lights[1] = new THREE.PointLight(0xffffff, 1, 0);
	lights[2] = new THREE.PointLight(0xffffff, 1, 0);

	lights[0].position.set(0, 200, 0);
	lights[1].position.set(100, 200, 100);
	lights[2].position.set(-100, -200, -100);

	scene.add(lights[0]);
	scene.add(lights[1]);
	scene.add(lights[2]);
	
	controls = new THREE.OrbitControls(camera, document.getElementById("nebula-view"));	
	controls.enableKeys = false;
	controls.target.set(0, 0, 0);

	var lastTime = new Date().getTime();
	function animate() {

		var timeNow = new Date().getTime();

		var dt = (timeNow - lastTime) / (60 * 1000);
		var dtheta = 2 * Math.PI * 1 * dt				
		mesh.rotation.x += dtheta;
		mesh.rotation.y += dtheta;
		
		renderer.render(scene, camera);

		requestAnimationFrame(animate);

		lastTime = timeNow;
	}

	animate();
}