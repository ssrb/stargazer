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

    public sample() : THREE.Vector3 {
        
        var maxu = -1, maxv = -1, maxf = -1, maxn = -1;
        
        for (var testi = 0; testi < this.maxtest; ++testi) {
            // pick random co-ords on the top face
            var rU = this.rand();
            var rV = this.rand();

            var u = Math.floor(rU * this.maskSize);
            var v = Math.floor(rV * this.maskSize);

            // pick a random face
            var facei = Math.floor(this.rand() * 6);
          
            // get the normalized noise value
            var n = this.faces[facei][((v * this.maskSize) + u) * 4] / 255;

            if (maxn < n) {
                maxu = rU;
                maxv = rV;
                maxf = facei;
                maxn = n;
            }

            // now see if the random value is less than the noise value
            // should give us a greater density of points for higher noise values
            if (this.threshold <= n * n) {
                break;
            }
        }

        var p = new THREE.Vector3( (maxu * 2.0) - 1.0 , 1.0, (maxv * 2.0) - 1.0);
        
        CubeMaterialSampler.RotatePoint(p, maxf);

        // TODO: properly project back from cube to sphere
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
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, prevFrameBuffer);

        return faces;
    }

    private static RotatePoint(p: THREE.Vector3, facei: number) : void
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

    private maskSize : number;
    private faces : Uint8Array[];
    private rand : prng;
    private maxtest : number;
    private threshold : number;

}
