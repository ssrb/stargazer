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

class Noise {
   
public constructor(seed: number)
{	
    var grad3: number[][] = [
        [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
        [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
        [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
        [1, 1, 0], [0, -1, 1], [-1, 1, 0], [0, -1, -1]
    ];

    
    var perm = new Array<number>(512 + 1);

    for (var i = 0; i < 256; ++i) {
        perm[i] = i;
    }

	var rand = seedrandom(seed);
    
    for (var i = 0; i < 256; ++i) {        
        var swapIndex = Math.floor(rand() * 256);
        var oldVal = perm[i];
        perm[i] = perm[swapIndex];
        perm[swapIndex] = oldVal;
    }

    for (var i = 0; i < 256; ++i) {
        perm[256 + i] = perm[i];
    }

    perm[512] = perm[0];

    this.permutations = new Uint8Array(256 * 256 * 4);
    var permutations = this.permutations;
    for (var Y = 0, offset = 0; Y < 256; ++Y) {
        for (var X = 0; X < 256; ++X, offset+=4) {            
            var A = perm[X]; 
            permutations[offset + 0] = perm[A + Y]; 
            permutations[offset + 1] = perm[A + Y + 1];
            var B = perm[X + 1];
            permutations[offset + 2] = perm[B + Y]; 
            permutations[offset + 3] = perm[B + Y + 1];            
        }
    }

    this.gradients = new Uint8Array(256 * 3);
    var gradients = this.gradients;  
    for (var i = 0, offset = 0; i < 256; ++i, offset += 3) {

        var index = perm[i] & 15;

        var v =  new THREE.Vector3(grad3[index][0], grad3[index][1], grad3[index][2]);
        v.normalize();
        v.multiplyScalar(0.5);
        v.addScalar(0.5);

        gradients[offset + 0] = Math.floor(v.x * 255.0);
        gradients[offset + 1] = Math.floor(v.y * 255.0);
        gradients[offset + 2] = Math.floor(v.z * 255.0);
    }

}


public permutations: Uint8Array;
public gradients: Uint8Array;

}

export = Noise;