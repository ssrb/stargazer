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

///<reference path="typings/index.d.ts"/>

var seedrandom = require('./bower_components/seedrandom/seedrandom.min.js');

import { Points } from './points';
import { FBMNoiseMaterial, RidgedFBMNoiseMaterial } from './noise';
import { Billboards } from './billboard';

var renderer: THREE.WebGLRenderer;
var camera: THREE.PerspectiveCamera;
var controls: THREE.OrbitControls;

var scene = new THREE.Scene();

var app: ng.IModule = angular.module('Nebula.App', []);

declare var Blockly: any;

Blockly.Blocks['space'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Space is");
    this.setNextStatement(true);
    Blockly.BlockSvg.START_HAT = true
  }
};


Blockly.Blocks['noise_fbm'] = {
   init: function() {
    this.appendDummyInput()
        .appendField("Noise FBM");
    this.setPreviousStatement(true, "COMMAND");
    this.setNextStatement(true, "COMMAND");
  }
};

Blockly.Blocks['noise_ridged'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Noise Ridged");
    this.setPreviousStatement(true, "COMMAND");
    this.setNextStatement(true, "COMMAND");
  }
};

Blockly.Blocks['stars'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Stars");
    this.setPreviousStatement(true, "COMMAND");
    this.setNextStatement(true, "COMMAND");
  }
};

Blockly.Blocks['billboards'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Billboards");
    this.setPreviousStatement(true, "COMMAND");
    this.setNextStatement(true, "COMMAND");
  }
};

var view = document.getElementById("nebula-view");
var blockly = document.getElementById("blockly-div");
var workspace : any;

function updateScene() : void {

}

function doResize(): void {
	var w = view.offsetWidth, h = window.innerHeight - document.getElementById("header").offsetHeight;
	w *= 0.95;
	h *= 0.95;
	renderer.setSize(w, h);
	blockly.style.height = h + "px";
	Blockly.svgResize(workspace);
	camera.updateProjectionMatrix();
}	

window.addEventListener('resize', doResize);
window.addEventListener('load', () => {

	workspace = Blockly.inject('blockly-div',
    {media: 'bower_components/google-blockly/media/',
     toolbox: document.getElementById('blockly-toolbox')});

	workspace.addChangeListener(updateScene);
	// workspace.addChangeListener(Blockly.Events.disableOrphans);
		
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio);

	camera = new THREE.PerspectiveCamera(30, 1, 0.1, 10000);	
	camera.position.z = 0.01;
		
	view.appendChild(renderer.domElement);
	
	scene.add(camera);
	
	scene.add(new THREE.Mesh(
				new THREE.SphereGeometry(1, 8, 8),
				new FBMNoiseMaterial(
					new THREE.Color(255/255, 0/255, 153/255),
					new THREE.Color(1 / 255, 79 / 255, 91 / 255),
					false
				)
	));

	scene.add(new THREE.Mesh(
				new THREE.SphereGeometry(1, 8, 8),
				new RidgedFBMNoiseMaterial(
					new THREE.Color("black"),
					new THREE.Color("black")
				)
	));

	scene.add(new Points(renderer));

	var bboards = new Billboards(scene, renderer);

	controls = new THREE.OrbitControls(camera, document.getElementById("nebula-view"));	
	controls.enablePan = controls.enableZoom = controls.enableKeys = false;
	controls.target.set(0, 0, 0);

	renderer.setClearColor(new THREE.Color("white"), 1.0);

	var lastTime = new Date().getTime();
	function animate() {

		var timeNow = new Date().getTime();

		// var dt = (timeNow - lastTime) / 1000;
		// var dtheta = 2 * Math.PI * 0.5 * dt				
			
		bboards.animate(camera);

		renderer.render(scene, camera);

		requestAnimationFrame(animate);

		lastTime = timeNow;
	}

	doResize();
	animate();
});


