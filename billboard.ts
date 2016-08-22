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

import { PointSampler, FBMNoiseMaterial } from "./noise";

export class Billboards extends THREE.Mesh {

	public constructor(		
		seed: string,
		numBillboards : number,
		sampler: PointSampler,
		size : number,
		near : THREE.Color,
		far : THREE.Color) {
		
	 	var textureLoader = new THREE.TextureLoader();
	 	var texture = textureLoader.load( "images/flare-blue-purple2.png" );
			
		super(new THREE.Geometry(), new THREE.MeshBasicMaterial({
				side: THREE.FrontSide, 
				map: texture, 
				transparent: true, 
				depthTest: false, 
				depthWrite: false
			}))

		var billboard = new THREE.Mesh( 
			new THREE.PlaneGeometry(0.1, 0.1),
			this.material
		);	
		
		var radius = 0.999;
				
		for (var pi = 0; pi < numBillboards; ++pi) {
			var p = sampler.sample(0.1);

			p.multiplyScalar(radius);

 	  		var b = billboard.clone();

 			b.position.x = p.x;
 			b.position.y = p.y;
 			b.position.z = p.z;

 			b.lookAt(new THREE.Vector3(0, 0, 0));

 			b.updateMatrix();
 			b.matrixAutoUpdate = false;
 			this.add(b);			
		}
	}

	public animate(camera : THREE.Camera) {

		var xCam = new THREE.Vector3();
		var yCam = new THREE.Vector3();
		var zCam = new THREE.Vector3();

		camera.matrixWorld.extractBasis( xCam, yCam, zCam );		

		var xBill = new THREE.Vector3();
		var yBill = new THREE.Vector3();
		var zBill = new THREE.Vector3();

		for (var i = 0; i < this.children.length; ++i) {
			
			this.children[i].matrix.extractBasis( xBill, yBill, zBill);			
			var pos = this.children[i].getWorldPosition();

			xBill.crossVectors(yCam, zBill);
			xBill.normalize();
			yBill.crossVectors(zBill, xBill);

			this.children[i].matrix.makeBasis(xBill, yBill, zBill);
			this.children[i].matrix.setPosition(pos);
		}
	}
}
