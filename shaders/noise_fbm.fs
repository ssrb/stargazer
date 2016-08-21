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

uniform sampler2D permTexture;
uniform sampler2D gradTexture; // <- sampler1D
uniform float ditherAmt;
uniform float gain;
uniform vec3 innerColor;
uniform float lacunarity;
uniform int octaves;
uniform vec3 outerColor;
uniform float powerAmt;
uniform float shelfAmt;
uniform float noiseScale;

varying vec3 vertexPos;

vec3 fade(vec3 t)  
{  
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); // new curve
}

vec4 perm2d(vec2 p)  
{  
    return texture2D(permTexture, p);  
}  
   
float gradperm(float x, vec3 p)  
{  
    vec3 v = texture2D(gradTexture, vec2(x, 0.5)).xyz; // <- texture1D
    v *= 2.0;
    v -= 1.0;    
    return dot(v, p);  
} 

// noise values returned are between -1.0 and 1.0!!!
float perlinNoise(vec3 p)
{
    vec3 P = mod(floor(p), 256.0);     // FIND UNIT CUBE THAT CONTAINS POINT  
    p -= floor(p);                      // FIND RELATIVE X,Y,Z OF POINT IN CUBE.  
    vec3 f = fade(p);                  // COMPUTE FADE CURVES FOR EACH OF X,Y,Z.  
   
    P = P / 256.0;
       
    // HASH COORDINATES OF THE 8 CUBE CORNERS  
    vec4 AA = perm2d(P.xy) + P.z;  
   
     // AND ADD BLENDED RESULTS FROM 8 CORNERS OF CUBE  
     return mix( mix( mix( gradperm(AA.x, p ),  
                              gradperm(AA.z, p + vec3(-1, 0, 0) ), f.x),  
                        mix( gradperm(AA.y, p + vec3(0, -1, 0) ),  
                              gradperm(AA.w, p + vec3(-1, -1, 0) ), f.x), f.y),  
                  mix( mix( gradperm(AA.x+(1.0 / 256.0), p + vec3(0, 0, -1) ),  
                              gradperm(AA.z+(1.0 / 256.0), p + vec3(-1, 0, -1) ), f.x),  
                        mix( gradperm(AA.y+(1.0 / 256.0), p + vec3(0, -1, -1) ),  
                              gradperm(AA.w+(1.0 / 256.0), p + vec3(-1, -1, -1) ), f.x), f.y), f.z);
}

/*
 * FBM (Fractal Brownian Motion) noise
 */
float fbmNoise(vec3 vIn, int octaves, float lacunarity, float gain)
{
    vec3 v = vIn;
    
    float noiseSum = 0.0;
    float amplitude = 1.0;
    float amplitudeSum = 0.0;
    
    // make some fbm noise
    const int kMaxOctave = 20;
    for( int i = 0; i < kMaxOctave; i++) {
        // webgl workaround for non-const loop boundary
        if (i >= octaves) {
            break;
        }
        noiseSum += perlinNoise(v) * amplitude;
        amplitudeSum += amplitude;
        amplitude *= gain;
        v *= lacunarity;
    }
    
    // get noiseSum in range -1..1   
    return noiseSum / amplitudeSum;
}

void main( void )
{
    vec3 v = normalize(vertexPos);
    float noiseSum = fbmNoise(noiseScale * v, octaves, lacunarity, gain);

    // add a crazy amount of dithering noise
    noiseSum += fbmNoise(v * 10000.0, 2, lacunarity, gain) * ditherAmt;

    // get noiseSum in range 0..1
    noiseSum = (noiseSum*0.5) + 0.5;
    
    // apply shelf
    noiseSum = max(0.0,noiseSum - shelfAmt);
    
    // scale whatever survives back into 0..1 range
    noiseSum *= 1.0/(1.0-shelfAmt);
    
    // apply optional power function
    noiseSum = pow(noiseSum,1.0/powerAmt);

    gl_FragColor.rgb = mix(outerColor, innerColor, noiseSum);
    gl_FragColor.a = noiseSum;
}
