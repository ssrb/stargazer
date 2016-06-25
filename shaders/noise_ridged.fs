uniform sampler2D permTexture;
uniform sampler2D gradTexture; // <- sampler1D
uniform float ditherAmt;
uniform float gain;
uniform vec3 innerColor;
uniform float lacunarity;
uniform float offset;
uniform int octaves;
uniform vec3 outerColor;
uniform float shelfAmt;
uniform float powerAmt;
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
vec3 v = texture2D(gradTexture, vec2(x, 0.5)).xyz;
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
* Ridge function for Ridged FBM noise below
*/
float ridge(float noiseVal, float offset)
{
  float newVal = offset - abs(noiseVal);
  return newVal * newVal;
}

/*
* Ridged FBM (Fractal Brownian Motion) noise
*/
float ridgedFbmNoise(vec3 vIn, int octaves, float lacunarity, float gain, float offset)
{
vec3 v = vIn;

float noiseSum = 0.0;
float amplitude = 1.0;
float amplitudeSum = 0.0;
float prev = 1.0;
float n;

// make some ridged fbm noise
const int kMaxOctave = 20;
for( int i = 0; i < kMaxOctave; i++) {
    // webgl workaround for non-const loop boundary
    if (i >= octaves) {
        break;
    }
    n = ridge(perlinNoise(v), offset);
    noiseSum += n * amplitude * prev;
    prev = n;
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
float noiseSum = ridgedFbmNoise(noiseScale * v, octaves, lacunarity, gain, offset);

// add a crazy amount of dithering noise
noiseSum += ridgedFbmNoise(v * 10000.0, octaves, lacunarity, gain, offset) * ditherAmt;

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