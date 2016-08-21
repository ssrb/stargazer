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

import './blocks';
import { Points } from './points';
import { FBMNoiseMaterial, RidgedFBMNoiseMaterial } from './noise';
import { Billboards } from './billboard';

var renderer : THREE.WebGLRenderer;
var camera : THREE.PerspectiveCamera;
var controls : THREE.OrbitControls;

var scene = new THREE.Scene();
var bboards : Billboards;

declare var Blockly: any;

var Nebula = [];

Nebula['nebula'] = (block) => {

	scene = new THREE.Scene();

	scene.add(camera);
	
	Blockly.JavaScript.statementToCode(block, 'Layers');
	
	return "";
};

Nebula['gas'] = (block) => {
	
	var mixblock = block.getInputTargetBlock("MIX");

	scene.add(new THREE.Mesh(
				new THREE.SphereGeometry(1, 8, 8),
				Nebula[mixblock.type](
					mixblock, 
					new THREE.Color(block.getFieldValue('INNER_COLOR')),
					new THREE.Color(block.getFieldValue('OUTER_COLOR'))
				)
	));
};

Nebula['dwarf_stars'] = (block) => {
	scene.add(new Points(
		renderer,
		block.getFieldValue('SEED'),
		block.getFieldValue('CARDINALITY'),
		block.getFieldValue('SIZE'),	
		new THREE.Color(block.getFieldValue('NEAR_COLOR')),
		new THREE.Color(block.getFieldValue('FAR_COLOR'))		
	));
};

Nebula['giant_stars'] = (block) => {
	bboards = new Billboards(
		scene, 
		renderer,
		block.getFieldValue('SEED'),
		block.getFieldValue('CARDINALITY'),
		block.getFieldValue('SIZE'),	
		new THREE.Color(block.getFieldValue('NEAR_COLOR')),
		new THREE.Color(block.getFieldValue('FAR_COLOR'))
	);
};

Nebula['fbm_noise'] = (block, inner = new THREE.Color("black"), outer = new THREE.Color("black")) => {
	return new RidgedFBMNoiseMaterial(
					"entropy",
					inner,
					outer
				);
};

var view = document.getElementById("nebula-view");
var blockly = document.getElementById("blockly-div");
var workspace : any;

function getRootBlock() {
  var blocks = workspace.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.type == 'nebula') {
      return block;
    }
  }
  return null;
}

function updateScene() : void {
	scene = new THREE.Scene();
	scene.add(camera);
    var nebula = getRootBlock();    
    for (var block = nebula.getInputTargetBlock("Layers"); block; block = block.nextConnection && block.nextConnection.targetBlock()) 
    {
		Nebula[block.type](block); 		
	}
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
 	Blockly.Xml.domToWorkspace(document.getElementById('blockly-startBlocks'), workspace);
	workspace.addChangeListener(updateScene);
	workspace.addChangeListener(Blockly.Events.disableOrphans);
		
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio);

	camera = new THREE.PerspectiveCamera(30, 1, 0.1, 10000);	
	camera.position.z = 0.01;
		
	view.appendChild(renderer.domElement);
				
	controls = new THREE.OrbitControls(camera, document.getElementById("nebula-view"));	
	controls.enablePan = controls.enableZoom = controls.enableKeys = false;
	controls.target.set(0, 0, 0);

	renderer.setClearColor(new THREE.Color("black"), 1.0);

	var lastTime = new Date().getTime();
	function animate() {

		var timeNow = new Date().getTime();

		// var dt = (timeNow - lastTime) / 1000;
		// var dtheta = 2 * Math.PI * 0.5 * dt				
			
		// bboards.animate(camera);

		renderer.render(scene, camera);

		requestAnimationFrame(animate);

		lastTime = timeNow;
	}

	doResize();
	requestAnimationFrame(animate);
});


