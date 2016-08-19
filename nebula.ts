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
var bboards : Billboards;

var app: ng.IModule = angular.module('Nebula.App', []);

declare var Blockly: any;

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#54994w
Blockly.Blocks['nebula'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Nebula");
    this.appendStatementInput("Layers")
        .setCheck("Layer");
    this.setColour(290);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['nebula'] = function(block) {

	scene = new THREE.Scene();

	scene.add(camera);
	
	Blockly.JavaScript.statementToCode(block, 'Layers');
	
	return "";
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#zt3k3v
Blockly.Blocks['gas'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Gas");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Seed")
        .appendField(new Blockly.FieldTextInput("entropy"), "SEED");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Near color")
        .appendField(new Blockly.FieldColour("#ff6600"), "NEAR_COLOR");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Far color")
        .appendField(new Blockly.FieldColour("#3366ff"), "FAR_COLOR");
    this.setPreviousStatement(true, ["Nebula", "Layer"]);
    this.setNextStatement(true, "Layer");
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['gas'] = function(block) {

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
	
	return "";
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#u99ymr
Blockly.Blocks['dwarf_stars'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Dwarf Stars");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Seed")
        .appendField(new Blockly.FieldTextInput("entropy"), "SEED");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Cardinality")
        .appendField(new Blockly.FieldNumber(0, 0), "CARDINALITY");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Size")
        .appendField(new Blockly.FieldNumber(0, 0), "SIZE");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Near color")
        .appendField(new Blockly.FieldColour("#ff6600"), "NEAR_COLOR");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Far color")
        .appendField(new Blockly.FieldColour("#3366ff"), "FAR_COLOR");
    this.appendValueInput("MASK")
        .setCheck("Mask")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Mask");
    this.setPreviousStatement(true, ["Nebula", "Layer"]);
    this.setNextStatement(true, "Layer");
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['dwarf_stars'] = function(block) {		
	scene.add(new Points(
		renderer,
		block.getFieldValue('SEED'),
		block.getFieldValue('CARDINALITY'),
		block.getFieldValue('SIZE'),	
		new THREE.Color(block.getFieldValue('NEAR_COLOR')),
		new THREE.Color(block.getFieldValue('FAR_COLOR'))
	));
	return "";
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#im2r56
Blockly.Blocks['giant_stars'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Giant Stars");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Seed")
        .appendField(new Blockly.FieldTextInput("entropy"), "SEED");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Cardinality")
        .appendField(new Blockly.FieldNumber(0, 0), "CARDINALITY");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Size")
        .appendField(new Blockly.FieldNumber(0, 0), "SIZE");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Near color")
        .appendField(new Blockly.FieldColour("#ff6600"), "NEAR_COLOR");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Far color")
        .appendField(new Blockly.FieldColour("#3366ff"), "FAR_COLOR");
    this.appendValueInput("MASK")
        .setCheck("Mask")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Mask");
    this.setPreviousStatement(true, ["Nebula", "Layer"]);
    this.setNextStatement(true, "Layer");
    this.setColour(290);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['giant_stars'] = function(block) {
	bboards = new Billboards(scene, renderer);
	return "";
};

var view = document.getElementById("nebula-view");
var blockly = document.getElementById("blockly-div");
var workspace : any;

function updateScene() : void {    
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    console.log(code);
	try {
		eval(code);
	} catch (e) {
		alert(e);
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


