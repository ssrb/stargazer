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

export interface Sampler {    
     sample() : THREE.Vector3;
}

export class UniformSampler implements Sampler {

    public constructor(seed : string) {
        this.rand = seedrandom(seed);
    }

    public sample() : THREE.Vector3 {
        var azimuth = 2 * Math.PI * this.rand();
        var z = 2 * this.rand() - 1;
        var r = Math.sqrt(1 - z * z);
        return new THREE.Vector3(r * Math.cos(azimuth), r * Math.sin(azimuth), z);
    }

    private rand : prng;
}

export class CubeMaterialSampler implements Sampler {

    public constructor(material : THREE.ShaderMaterial, renderer : THREE.WebGLRenderer, maskSize = 512, seed : string, threshold : number, maxtest : number)
    {       
        this.maskSize = maskSize;
        this.faces = CubeMaterialSampler.RenderFaces(material, renderer, maskSize);
        this.rand = seedrandom(seed);
        this.threshold = threshold;
        this.maxtest = maxtest;        
    }

    private plotSample(u: number, v: number, facei: number) {
        var canvas = <HTMLCanvasElement>document.getElementById("debug-canvas-" + (facei + 1));
        var ctx = canvas.getContext("2d");

        var r = 255, g = 0, b = 0, a = 255;

        var id = ctx.createImageData(1,1);
        var d  = id.data;
        d[0]  = r;
        d[1]  = g;
        d[2]  = b;
        d[3]  = a;
        ctx.putImageData( id, Math.floor(u * this.maskSize), Math.floor(v * this.maskSize));
    }

    public sample() : THREE.Vector3 {
        
        var bestu = -1, bestv = -1, bestn = 1.0;
        
        var facei = Math.floor(this.rand() * 6);

        for (var testi = 0; testi < this.maxtest; ++testi) {
            // pick random co-ords on the top face
            var rU = this.rand();
            var rV = this.rand();

            var mU = Math.floor(rU * this.maskSize);
            var mV = Math.floor(rV * this.maskSize);

            // get the normalized noise value
            var n = this.faces[facei][((mV * this.maskSize) + mU) * 4] / 255;

            if (bestn > n) {
                bestu = rU;
                bestv = rV;
                bestn = n;
            }

            var r = this.rand();
            // now see if the random value is less than the noise value
            // should give us a greater density of points for higher noise values
            if (r * r > n) {
                break;
            }
        }

        this.plotSample(bestu, bestv, facei);
        
        var p = CubeMaterialSampler.ProjectPoint(bestu, bestv, facei);
        p.normalize();

        return p;
    }

    private static RenderFaces(material : THREE.ShaderMaterial, renderer : THREE.WebGLRenderer, maskSize: number) : Uint8Array[] {
        
        var maskScene = new THREE.Scene();

        material.transparent = false;

        maskScene.add(new THREE.Mesh(
            new THREE.SphereGeometry(1, 8, 8),
            material
        ));

        var cubeCamera = new THREE.CubeCamera(0.1, 100000, maskSize);
        maskScene.add( cubeCamera );

        cubeCamera.updateCubeMap(renderer, maskScene);

        // This bypass THREE public API and might break with newer versions
        var framebuffer = (<any>renderer).properties.get(cubeCamera.renderTarget).__webglFramebuffer;

        var gl = renderer.getContext();
        var prevFrameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);

        var faces : Uint8Array[] = [];
        for (var facei = 0; facei < 6; ++facei) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[facei]);
            faces[facei] = new Uint8Array(cubeCamera.renderTarget.width * cubeCamera.renderTarget.height * 4);
            gl.readPixels(0, 0, cubeCamera.renderTarget.width, cubeCamera.renderTarget.height, gl.RGBA,gl.UNSIGNED_BYTE, faces[facei]);

            var canvas = <HTMLCanvasElement>document.getElementById("debug-canvas-" + (facei + 1));
            canvas.height = 256;
            canvas.width = 256;
            var ctx = canvas.getContext("2d");           
            ctx.putImageData(new ImageData(new Uint8ClampedArray(faces[facei]), 512, 512), 0, 0);          
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, prevFrameBuffer);

        
        return faces;
    }

    private static ProjectPoint(u: number, v: number, facei: number) : THREE.Vector3
    {
        u = 2 * u - 1;
        v = 2 * v - 1;

        switch(facei) {
        case 0:
            return new THREE.Vector3( 1, -v, -u);
        case 1:
            return new THREE.Vector3(-1, -v,  u);
        case 2:
            return new THREE.Vector3( u,  1,  v);
        case 3:
            return new THREE.Vector3( u, -1, -v);
        case 4:
            return new THREE.Vector3( u, -v,  1);
        case 5:
            return new THREE.Vector3(-u, -v, -1);
        default:
       }

       return new THREE.Vector3();
    }

    private maskSize : number;
    private faces : Uint8Array[];
    private rand : prng;
    private maxtest : number;
    private threshold : number;

}
