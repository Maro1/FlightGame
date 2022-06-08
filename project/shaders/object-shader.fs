precision mediump float;

varying vec3 v_Normal;
varying vec3 v_FragPos;
varying vec2 v_TexCoord;

uniform sampler2D diffuseMap;
uniform sampler2D specularMap;

uniform samplerCube skybox;

uniform vec3 viewPos;

uniform vec3 lightPos;

const vec3 directionalLight = vec3(0.53, 0.76, -0.37);

void main() {
  vec3 worldNormal = normalize(v_Normal);
  vec3 eyeToSurfaceDir = normalize(v_FragPos - viewPos);
  vec3 direction = reflect(eyeToSurfaceDir, worldNormal);

  gl_FragColor = textureCube(skybox, direction);
}