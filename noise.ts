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

var grad3: number[][] = [
    [1, 1, 0 ], [ -1, 1, 0 ], [ 1, -1, 0 ], [ -1, -1, 0 ],
	[ 1, 0, 1 ], [ -1, 0, 1 ], [ 1, 0, -1 ], [ -1, 0, -1 ],
	[ 0, 1, 1 ], [ 0, -1, 1 ], [ 0, 1, -1 ], [ 0, -1, -1 ],
	[ 1, 1, 0 ], [ 0, -1, 1 ], [ -1, 1, 0 ], [ 0, -1, -1 ]
];


/*
 * Helper functions to compute gradients-dot-residualvectors (1D to 4D)
 * Note that these generate gradients of more than unit length. To make
 * a close match with the value range of classic Perlin noise, the final
 * noise values need to be rescaled to fit nicely within [-1,1].
 */
function grad(hash : number, x : number, y : number, z : number) : number
{
    var h = hash & 15;     // Convert low 4 bits of hash code into 12 simple
    var u = h < 8 ? x : y; // gradient directions, and compute dot product.
    var v = h < 4 ? y : h == 12 || h == 14 ? x : z; // Fix repeats at h = 12 to 15
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}


// function initNoise(seed : number): void
// {
// 	var mPermutations : number[] = [];
// 	var mGradients : number[] = [];
//     // update the permutation table
//     // thank you http://britonia-game.com/?p=60
//     for (var i = 0; i < 256; i++) {
//         mPermutations[i] = i;
//     }

// 	// seed a random number generator
// 	var rand = seedrandom(seed);
    
//     // randomize the permutation table
//     for (var i = 0; i < 256; i++) {
//         // for each value swap with a random slot in the array 
//         var swapIndex = rand() % 256;

//         var oldVal = mPermutations[i];
//         mPermutations[i] = mPermutations[swapIndex];
//         mPermutations[swapIndex] = oldVal;
//     }

//     for (var i = 0; i < 256; i++) {
//         mPermutations[i + 256] = mPermutations[i];
//         var h = mPermutations[i] & 15;
//         mGradients[i] = Vector3(grad3[h][0], grad3[h][1], grad3[h][2]).normalisedCopy();
//         mGradients[i + 256] = mGradients[i];
//     }
// }


// // we add the Z part in the shader
// for (int Y = 0; Y < 256; Y++) {
//     for (int X = 0; X < 256; X++) {
//         int offset = (Y * 256 + X) * 4;

//         uchar A = mPermutations[X]; // A = mPermutations[X]+Y (add y later below)
//         permTexture[offset + 0] = mPermutations[A + Y]; // AA = mPermutations[A]+Z (add z in shader)
//         permTexture[offset + 1] = mPermutations[A + Y + 1]; // AB = mPermutations[A+1]+Z
//         uchar B = mPermutations[X + 1]; // we add the y later
//         permTexture[offset + 2] = mPermutations[B + Y]; // BA = mPermutations[B]+Z (add z in shader)
//         permTexture[offset + 3] = mPermutations[B + Y + 1]; // BB = mPermutations[B+1]+Z (add z in shader)             
//     }
// }

// for (int i = 0; i < 256; i++) {
//     int offset = i * 3;
//     int index = mPermutations[i] & 15;
//     Vector3 v = Vector3(grad3[index][0], grad3[index][1], grad3[index][2]);
//     v.normalise();
//     v *= 0.5;
//     v += 0.5;

//     gradTexture[offset + 0] = floor(v.x * 255.0);
//     gradTexture[offset + 1] = floor(v.y * 255.0);
//     gradTexture[offset + 2] = floor(v.z * 255.0);
// }