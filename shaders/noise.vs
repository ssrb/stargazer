uniform mat4 worldViewProj;
varying vec3 vertexPos;
void main()
{
   gl_Position = worldViewProj * gl_Vertex;
   vertexPos = normalize(gl_Vertex.xyz);
}
