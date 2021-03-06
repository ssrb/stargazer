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
import { Sampler, UniformSampler, CubeMaterialSampler } from './sampler';
import { Billboards } from './billboard';

var renderer : THREE.WebGLRenderer;
var camera : THREE.PerspectiveCamera;
var controls : THREE.OrbitControls;

var scene = new THREE.Scene();
var bboards : Billboards;

declare var Blockly: any;

function getSampler(block, seed) : Sampler {

	var maskblock = block.getInputTargetBlock("MASK");

	var sampler : Sampler;
	if (maskblock) {
		var mask = Layers[maskblock.type](
			maskblock,	
			new THREE.Color("black"), 
			new THREE.Color("white")
		);
		return new CubeMaterialSampler(mask, renderer, 512, seed, 0.1, 10);
	}

	return new UniformSampler(seed);
}

var Layers = [];

Layers['nebula'] = (block) => {

	scene = new THREE.Scene();

	scene.add(camera);
	
	Blockly.JavaScript.statementToCode(block, 'Layers');
};

Layers['gas'] = (block) => {
	
	var mixblock = block.getInputTargetBlock("MIX");
	
	return mixblock ? new THREE.Mesh(
				new THREE.SphereGeometry(1, 8, 8),
				Layers[mixblock.type](
					mixblock, 
					new THREE.Color(block.getFieldValue('INNER_COLOR')),
					new THREE.Color(block.getFieldValue('OUTER_COLOR'))
				)
	) : null;
};

Layers['dwarf_stars'] = (block) => {

	var seed = block.getFieldValue('SEED');

	return new Points(
		getSampler(block, seed),
		seed,
		Number(block.getFieldValue('CARDINALITY')),
		Number(block.getFieldValue('SIZE')),
		new THREE.Color(block.getFieldValue('NEAR_COLOR')),
		new THREE.Color(block.getFieldValue('FAR_COLOR'))		
	);
};

Layers['giant_stars'] = (block) => {
	
	var seed = block.getFieldValue('SEED');

	var imagePath = "images/" + block.getFieldValue('TEXTURE') + ".png";

	return new Billboards(		
		seed,
		imagePath,		
		Number(block.getFieldValue('CARDINALITY')),
		getSampler(block, seed),
		Number(block.getFieldValue('NEAR_SIZE')),
		Number(block.getFieldValue('FAR_SIZE')),
		new THREE.Color(block.getFieldValue('NEAR_COLOR')),
		new THREE.Color(block.getFieldValue('FAR_COLOR'))
	);
};

Layers['fbm_noise'] = (block, inner : THREE.Color, outer : THREE.Color) => {
	return new FBMNoiseMaterial(
					block.getFieldValue('SEED'),
					inner,
					outer,
					Number(block.getFieldValue('DITHER')),
					Number(block.getFieldValue('GAIN')),
					Number(block.getFieldValue('LACUNARITY')),					
					Number(block.getFieldValue('OCTAVES')),
					Number(block.getFieldValue('POWER')),
					Number(block.getFieldValue('THRESHOLD')),
					Number(block.getFieldValue('SCALE'))
				);
};

Layers['rfbm_noise'] = (block, inner : THREE.Color, outer : THREE.Color) => {
	return new RidgedFBMNoiseMaterial(
					block.getFieldValue('SEED'),
					inner,
					outer,
					Number(block.getFieldValue('DITHER')),
					Number(block.getFieldValue('GAIN')),
					Number(block.getFieldValue('LACUNARITY')),
					Number(block.getFieldValue('OFFSET')),
					Number(block.getFieldValue('OCTAVES')),
					Number(block.getFieldValue('POWER')),
					Number(block.getFieldValue('THRESHOLD')),
					Number(block.getFieldValue('SCALE'))
				);
};

var view = document.getElementById("stargazer-view");
var blockly = document.getElementById("blockly-div");
var workspace : any;

function getRootBlock() {
  var blocks = workspace.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.type == 'starsystem') {
      return block;
    }
  }
  return null;
}

function updateScene() : void {
	scene = new THREE.Scene();
	scene.add(camera);
    var root = getRootBlock();      
    for (var block = root.getInputTargetBlock("Layers"), first = true; block; block = block.nextConnection && block.nextConnection.targetBlock()) 
    {
    	if (!block.disabled) {
			var layer = Layers[block.type](block);
			if (layer) {
				if (first) {
					//layer.material.transparent = false;
					first = false;
				}
				scene.add(layer);			
			}
		}
	}

	var xml = Blockly.Xml.workspaceToDom(workspace);
	var xml_text = Blockly.Xml.domToText(xml);
	console.log(xml_text);
}

function doResize(): void {
	var doc = <any>document;
	if (!doc.mozFullScreenElement && !doc.webkitFullscreenElement) {
		var w = view.offsetWidth, h = window.innerHeight - document.getElementById("header").offsetHeight;
		w *= 0.95;
		h *= 0.95;
		renderer.setSize(w, h);
		blockly.style.height = h + "px";
		Blockly.svgResize(workspace);
		camera.updateProjectionMatrix();
	} else {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.updateProjectionMatrix();
	}
}

function toggleFullScreen() {
	var doc = <any>document;
	if (!doc.mozFullScreenElement && !doc.webkitFullscreenElement) {
		var canvas = <any>renderer.domElement;
		if (canvas.mozRequestFullScreen) {
			canvas.mozRequestFullScreen();
		} else {
			canvas.webkitRequestFullscreen((<any>Element).ALLOW_KEYBOARD_INPUT);
		}
	} else {
		if (doc.mozCancelFullScreen) {
			doc.mozCancelFullScreen();
		} else {
			doc.webkitExitFullscreen();
		}
	}
}

window.addEventListener('resize', doResize);
window.addEventListener('load', () => {

	document.addEventListener("keydown", e => {
		if (e.keyCode == 122) {
			e.preventDefault();
			toggleFullScreen();
		}
	}, false);

	workspace = Blockly.inject('blockly-div',
    {media: 'bower_components/google-blockly/media/',
    zoom:
         {controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2},
     toolbox: document.getElementById('blockly-toolbox')});
 	Blockly.Xml.domToWorkspace(document.getElementById('blockly-startBlocks'), workspace);
	workspace.addChangeListener(updateScene);
	workspace.addChangeListener(Blockly.Events.disableOrphans);
		
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio);

	camera = new THREE.PerspectiveCamera(30, 1, 0.1, 10000);	
	camera.position.z = 0.01;
		
	view.appendChild(renderer.domElement);
	renderer.domElement.style.background = "black";

	renderer.domElement.addEventListener("dblclick", e => {
		toggleFullScreen();
	}, false);
				
	controls = new THREE.OrbitControls(camera, renderer.domElement);
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


