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

class NoiseData {
   
    public constructor(seed: number) {	
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

class NoiseTextures {
    public constructor(seed : number) {

        this.noiseData = new NoiseData(seed);

        this.permTexture = new THREE.DataTexture(
            <any>this.noiseData.permutations,
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
        this.permTexture.anisotropy = 1.0;
        this.permTexture.needsUpdate = true;
        this.permTexture.generateMipmaps = false;
       
        this.gradTexture = new THREE.DataTexture(
            <any>this.noiseData.gradients,
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
        this.gradTexture.anisotropy = 1.0;
        this.gradTexture.needsUpdate = true;
        this.gradTexture.generateMipmaps = false;
    }

     private noiseData: NoiseData;
     public permTexture: THREE.DataTexture;
     public gradTexture: THREE.DataTexture;   
};

// Browserify will bundle shaders and js all together for us.
// In order to do so, the tool must find a 'require' with a string literal argument
// to figure out what must be bundled together
require('./shaders/noise.vs');
require('./shaders/noise_fbm.fs');
require('./shaders/noise_ridged.fs');

export class FBMNoiseMaterial extends THREE.ShaderMaterial {

    public constructor(innerColor: THREE.Color, outerColor: THREE.Color, transparent = true) {
       
        this.textures = new NoiseTextures(132);

        super({
            uniforms: {
                permTexture: { value: this.textures.permTexture},
                gradTexture: { value: this.textures.gradTexture},
                ditherAmt: { value: 0.03},
                gain: { value: 0.5},
                innerColor: { value: innerColor },
                lacunarity: { value: 2.0},
                octaves: { value: 8},
                outerColor: { value: outerColor },
                powerAmt: { value: 1.0},
                shelfAmt: { value: 0.0},
                noiseScale: { value: 1.0}
            },            
            vertexShader: require('./shaders/noise.vs')(),            
            fragmentShader: require('./shaders/noise_fbm.fs')(),
            side: THREE.BackSide,
            transparent: transparent,
            depthTest: false, 
            depthWrite: false
        });
    }
   
    private textures : NoiseTextures;
}

export class RidgedFBMNoiseMaterial extends THREE.ShaderMaterial {

    public constructor(innerColor: THREE.Color, outerColor: THREE.Color, transparent = true) {
       
        this.textures = new NoiseTextures(132);

        super({
            uniforms: {
                permTexture: { value: this.textures.permTexture },
                gradTexture: { value: this.textures.gradTexture },
                ditherAmt: { value: 0.03 },
                gain: { value: 0.5 },
                innerColor: { value: innerColor },
                lacunarity: { value: 2.0 },
                offset: {value: 1.0},
                octaves: { value: 7 },
                outerColor: { value: outerColor },
                powerAmt: { value: 1.0 },
                shelfAmt: { value: 0.0 },
                noiseScale: { value: 1.0 }
            },

            vertexShader: require('./shaders/noise.vs')(),
            fragmentShader: require('./shaders/noise_ridged.fs')(),
            side: THREE.BackSide,
            transparent: true,
            depthTest: false, 
            depthWrite: false
        });
    }
   
    private textures : NoiseTextures;
}

export class PointSampler {

    public constructor(material : THREE.ShaderMaterial, renderer : THREE.WebGLRenderer, maskSize = 512)
    {
        this.maskSize = maskSize;
        this.faces = PointSampler.RenderFaces(material, renderer, maskSize);
        this.rand = seedrandom(132);
    }

    public sample(threshold = 0, maxtest = 10) : THREE.Vector3 {

        if (threshold < 0) {
            threshold = this.rand();
        }

        var maxu = -1, maxv = -1, maxf = -1, maxn = -1;
        
        for (var testi = 0; testi < maxtest; ++maxtest) {
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
            if (threshold <= n * n) {
                break;
            }
        }

        var p = new THREE.Vector3( (maxu * 2.0) - 1.0 , 1.0, (maxv * 2.0) - 1.0);
        
        PointSampler.RotatePoint(p, maxf);

        // TODO: properly project back from cube to sphere
        p.normalize();
        
        return p;
    }

    private static RenderFaces(material : THREE.ShaderMaterial, renderer : THREE.WebGLRenderer, maskSize: number) : Uint8Array[] {
        
        var maskScene = new THREE.Scene();

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

}
