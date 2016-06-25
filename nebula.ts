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

import Noise = require('./noise');

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

var noise = new Noise(0);

var app: ng.IModule = angular.module('Nebula.App', []);

window.onload = () => {

	var view = document.getElementById("nebula-view");

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio);

	camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10000);
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

	var permTexture = new THREE.DataTexture(
		<any>noise.permutations,
		256,
		256,
		THREE.RGBAFormat,
		THREE.UnsignedByteType, 
		undefined, 
		THREE.RepeatWrapping,
		THREE.RepeatWrapping,
		undefined,
		undefined
	);
	permTexture.needsUpdate = true;

	var gradTexture = new THREE.DataTexture(
		<any>noise.gradients,
		256,
		1,
		THREE.RGBFormat,
		THREE.UnsignedByteType, 
		undefined, 
		THREE.RepeatWrapping, 
		THREE.RepeatWrapping,
		undefined,
		undefined
	);
	gradTexture.needsUpdate = true;

	var material = new THREE.ShaderMaterial({

		// fbm
		uniforms: {
			permTexture: { value: permTexture},
			gradTexture: { value: gradTexture},
			ditherAmt: { value: 0.1},
			gain: { value: 0.5},
			innerColor: { value: new THREE.Vector3(249/255, 52/255, 1.0)},
			lacunarity: { value: 2.0},
			octaves: { value: 3},
			outerColor: { value: new THREE.Vector3(8 / 255, 27 / 255, 89 / 255) },
			powerAmt: { value: 1.0},
			shelfAmt: { value: 0.0},
			noiseScale: { value: 2.0}
		},
		
		// ridged
		// uniforms: {
		// 	permTexture: { value: permTexture },
		// 	gradTexture: { value: gradTexture },
		// 	ditherAmt: { value: 0.1 },
		// 	gain: { value: 0.1 },
		// 	innerColor: { value: new THREE.Vector3(19 / 255, 34 / 255, 1.0) },
		// 	lacunarity: { value: 1.0 },
		// 	offset: {value: 0.0},
		// 	octaves: { value: 2 },
		// 	outerColor: { value: new THREE.Vector3(0, 0, 0) },
		// 	powerAmt: { value: 1.0 },
		// 	shelfAmt: { value: 0.0 },
		// 	noiseScale: { value: 10.0 }
		// },

		vertexShader: require('./shaders/noise.vs')(),
		// fbm
		fragmentShader: require('./shaders/noise_fbm.fs')(),		
		// ridged
		//fragmentShader: require('./shaders/noise_ridged.fs')()

		side: THREE.BackSide,		
	});

	mesh = new THREE.Mesh(
		new THREE.SphereGeometry(1, 16, 16),
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
	controls.enablePan = controls.enableZoom = false;
	controls.enableKeys = false;
	controls.target.set(0, 0, 0);

	renderer.setClearColor(new THREE.Color("black"));

	var lastTime = new Date().getTime();
	function animate() {

		var timeNow = new Date().getTime();

		var dt = (timeNow - lastTime) / (60 * 1000);
		var dtheta = 2 * Math.PI * 0.5 * dt				
		mesh.rotation.x += dtheta;
		mesh.rotation.y += dtheta;
		
		renderer.render(scene, camera);

		requestAnimationFrame(animate);

		lastTime = timeNow;
	}

	animate();
}