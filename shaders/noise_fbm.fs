uniform sampler2D permTexture;
uniform sampler1D gradTexture;
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
    vec3 v = texture1D(gradTexture, x).xyz;
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
    for( int i = 0; i < octaves; i++) {
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

    gl_FragColor.xyz = mix(outerColor, innerColor, noiseSum);
    gl_FragColor.w = noiseSum;
}