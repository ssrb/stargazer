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

var seedrandom = require('./bower_components/seedrandom/seedrandom.min.js');

import Noise = require('./noise');
import Points = require('./points');

// Browserify will bundle shaders and js all together for us.
// In order to do so, the tool must find a 'require' with a string literal argument
// to figure out what must be bundled together
require('./shaders/noise.vs');
require('./shaders/noise_fbm.fs');
require('./shaders/noise_ridged.fs');

var renderer: THREE.WebGLRenderer;
var mesh1: THREE.Mesh;
var mesh2: THREE.Mesh;
var camera: THREE.PerspectiveCamera;
var controls: THREE.OrbitControls;	

var app: ng.IModule = angular.module('Nebula.App', []);

window.onload = () => {

	var view = document.getElementById("nebula-view");

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false});
	renderer.setPixelRatio(window.devicePixelRatio);

	camera = new THREE.PerspectiveCamera(30, 1, 0.1, 10000);
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

	var noise1 = new Noise(0);

	var permTexture1 = new THREE.DataTexture(
		<any>noise1.permutations,
		256,
		256,
		THREE.RGBAFormat,
		THREE.UnsignedByteType, 
		THREE.UVMapping, 
		THREE.RepeatWrapping,
		THREE.RepeatWrapping,
		THREE.LinearFilter,
		THREE.LinearFilter
	);
	permTexture1.anisotropy = 1.0;
	permTexture1.needsUpdate = true;
	permTexture1.generateMipmaps = false;
	permTexture1.premultiplyAlpha = false;

	var gradTexture1 = new THREE.DataTexture(
		<any>noise1.gradients,
		256,
		1,
		THREE.RGBFormat,
		THREE.UnsignedByteType, 
		THREE.UVMapping, 
		THREE.RepeatWrapping, 
		THREE.RepeatWrapping,
		THREE.LinearFilter,
		THREE.LinearFilter
	);
	gradTexture1.anisotropy = 1.0;
	gradTexture1.needsUpdate = true;
	gradTexture1.generateMipmaps = false;

	var material1 = new THREE.ShaderMaterial({

		// fbm
		uniforms: {
			permTexture: { value: permTexture1},
			gradTexture: { value: gradTexture1},
			ditherAmt: { value: 0.03},
			gain: { value: 0.5},
			innerColor: { value: new THREE.Vector3(255/255, 0/255, 153/255)},
			lacunarity: { value: 2.0},
			octaves: { value: 8},
			outerColor: { value: new THREE.Vector3(1 / 255, 79 / 255, 91 / 255) },
			powerAmt: { value: 1.0},
			shelfAmt: { value: 0.0},
			noiseScale: { value: 1.0}			
		},
		
		vertexShader: require('./shaders/noise.vs')(),
		// fbm
		fragmentShader: require('./shaders/noise_fbm.fs')(),		

	});
	material1.transparent = true;
	material1.side = THREE.BackSide;	
	material1.blendSrc = THREE.OneFactor;
	material1.blendDst = <any>THREE.ZeroFactor;
	material1.blending = THREE.NormalBlending;

	mesh1 = new THREE.Mesh(
		new THREE.SphereGeometry(1, 64, 64),
		material1
	);
	
	var noise2 = new Noise(1);

	var permTexture2 = new THREE.DataTexture(
		<any>noise2.permutations,
		256,
		256,
		THREE.RGBAFormat,
		THREE.UnsignedByteType, 
		THREE.UVMapping, 
		THREE.RepeatWrapping,
		THREE.RepeatWrapping,
		THREE.LinearFilter,
		THREE.LinearFilter
	);
	permTexture2.anisotropy = 1.0;
	permTexture2.needsUpdate = true;
	permTexture2.generateMipmaps = false;

	var gradTexture2 = new THREE.DataTexture(
		<any>noise2.gradients,
		256,
		1,
		THREE.RGBFormat,
		THREE.UnsignedByteType, 
		THREE.UVMapping, 
		THREE.RepeatWrapping, 
		THREE.RepeatWrapping,
		THREE.LinearFilter,
		THREE.LinearFilter
	);
	gradTexture2.anisotropy = 1.0;
	gradTexture2.needsUpdate = true;
	gradTexture2.generateMipmaps = false;

	var material2 = new THREE.ShaderMaterial({

		// ridged
		uniforms: {
			permTexture: { value: permTexture2 },
			gradTexture: { value: gradTexture2 },
			ditherAmt: { value: 0.03 },
			gain: { value: 0.5 },
			innerColor: { value: new THREE.Color("black") },
			lacunarity: { value: 2.0 },
			offset: {value: 1.0},
			octaves: { value: 7 },
			outerColor: { value: new THREE.Color("black") },
			powerAmt: { value: 1.0 },
			shelfAmt: { value: 0.0 },
			noiseScale: { value: 1.0 }
		},

		vertexShader: require('./shaders/noise.vs')(),
		fragmentShader: require('./shaders/noise_ridged.fs')()
	});
	material2.transparent = true;
	material2.side = THREE.BackSide;		
	material2.blendSrc = <any>THREE.SrcAlphaFactor;
	material2.blendDst = <any>THREE.OneMinusSrcAlphaFactor;
	material2.blending = THREE.NormalBlending;

	mesh2 = new THREE.Mesh(
		new THREE.SphereGeometry(1, 64, 64),
		material2
	);
	

	var backgorund = new THREE.Mesh(
		new THREE.SphereGeometry(2, 64, 64),
		new THREE.MeshPhongMaterial({
			color: "white",
			side: THREE.BackSide, transparent : false})
	);

	scene.add(backgorund);
	scene.add(mesh1);
	scene.add(mesh2);


	
	var maskMaterial = new THREE.ShaderMaterial({

		// fbm
		uniforms: {
			permTexture: { value: permTexture1},
			gradTexture: { value: gradTexture1},
			ditherAmt: { value: 0.03},
			gain: { value: 0.5},
			innerColor: { value: new THREE.Color("black")},
			lacunarity: { value: 2.0},
			octaves: { value: 8},
			outerColor: { value: new THREE.Color("white")},
			powerAmt: { value: 1.0},
			shelfAmt: { value: 0.0},
			noiseScale: { value: 1.0}			
		},
		
		vertexShader: require('./shaders/noise.vs')(),
		// fbm
		fragmentShader: require('./shaders/noise_fbm.fs')(),		

	});
	maskMaterial.side = THREE.BackSide;	


	var maskScene = new THREE.Scene();
	maskScene.add(new THREE.Mesh(
		new THREE.SphereGeometry(1, 64, 64),
		maskMaterial
	));

	var maskSize = 512;

	var cubeCamera = new THREE.CubeCamera( 0.1, 100000, maskSize);
	maskScene.add( cubeCamera );

	cubeCamera.updateCubeMap(renderer, maskScene);
	var framebuffer = (<any>renderer).properties.get( cubeCamera.renderTarget ).__webglFramebuffer;

	var gl = renderer.getContext();
	var prevFrameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
	
	var faces : Uint8Array[] = [];
	for (var facei = 0; facei < 6; ++facei) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[facei]);
		faces[facei] = new Uint8Array(cubeCamera.renderTarget.width * cubeCamera.renderTarget.height * 4);
		gl.readPixels(0, 0, cubeCamera.renderTarget.width, cubeCamera.renderTarget.height, gl.RGBA,gl.UNSIGNED_BYTE, faces[facei]);
	}
	gl.bindFramebuffer(gl.FRAMEBUFFER, prevFrameBuffer);


	var geometry = new THREE.Geometry();

	var far = new THREE.Color("white"), near = new THREE.Color("blue");
    
	var mNumPoints = 0;
	var rand = seedrandom(132);
	var radius = 0.999;

    var numPointsTested = 0;
   
    var maxNumPoints = 1000;

	while(mNumPoints < maxNumPoints && numPointsTested < 10 * maxNumPoints) {

        // pick random co-ords on the top face
        var rU = rand();
        var rV = rand();

		var u = Math.floor(rU * maskSize);
        var v = Math.floor(rV * maskSize);

        // pick a random face
        var facei = Math.floor(rand() * 6);

        // use noise mask to discard positions
        ++numPointsTested;

        // get the noise value at this position 0..255
        var n = faces[facei][((v * maskSize) + u) * 4];

        // scale n to between 0..1
        n /= 255;

        // now see if the random value is less than the noise value
        // should give us a greater density of points for higher noise values
        if (rand() <= (n * n)) {           
  			++mNumPoints;
	  
	        var p = new THREE.Vector3( (rU * 2.0) - 1.0 , 1.0, (rV * 2.0) - 1.0);

			// rotate v to this face on the unit cube centered at 0,0,0
	        rotatePoint(p, facei);

	        p.normalize();
	        p.multiplyScalar(radius);

			geometry.vertices.push(p);
	        	      
	    	geometry.colors.push(
				far.clone().lerp(near, rand())
			);
        }               
    }
    

	scene.add(new THREE.Points( geometry, new THREE.PointsMaterial({size: 0.001, vertexColors: THREE.VertexColors, transparent: true}) ));
	
	var textureLoader = new THREE.TextureLoader();
	var texture1 = textureLoader.load( "images/flare-blue-purple2.png" );
	scene.add(new THREE.Mesh( new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshBasicMaterial( {side: THREE.DoubleSide, map: texture1, transparent: true} )));

	controls = new THREE.OrbitControls(camera, document.getElementById("nebula-view"));	
	controls.enablePan = controls.enableZoom = controls.enableKeys = false;	 
	controls.target.set(0, 0, 0);

	renderer.setClearColor(new THREE.Color("white"), 1.0);

	var lastTime = new Date().getTime();
	function animate() {

		var timeNow = new Date().getTime();

		var dt = (timeNow - lastTime) / (60 * 1000);
		var dtheta = 2 * Math.PI * 0.5 * dt				
		//mesh.rotation.x += dtheta;
		//mesh.rotation.y += dtheta;
		
		renderer.render(scene, camera);

		requestAnimationFrame(animate);

		lastTime = timeNow;
	}

	animate();
}


function rotatePoint(p: THREE.Vector3, facei: number) : void
{
	var vTmp = p.clone();

	if(facei == 0) {
		// right
		p.x = vTmp.y;
		p.y = -vTmp.z;
		p.z = -vTmp.x;
	}
	else if(facei == 1) {
		// left
		p.x = -vTmp.y;
		p.y = -vTmp.z;
		p.z = vTmp.x;
	}
	else if(facei == 2) {
	// top - do nothing
	}
	else if(facei == 3) {
		// bottom
		p.y = -vTmp.y;
		p.z = -vTmp.z;
	}
	else if(facei == 4) {
		// front
		p.y = -vTmp.z;
		p.z = vTmp.y;
	}
	else if(facei ==  5) {
		// back
		p.x = -vTmp.x;
		p.y = -vTmp.z;
		p.z = -vTmp.y;
	}
	p.z = -p.z;
}