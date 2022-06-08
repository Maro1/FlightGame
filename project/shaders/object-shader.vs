precision mediump float;

attribute vec3 a_Pos;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;

varying vec3 v_Normal;
varying vec3 v_FragPos;
varying vec2 v_TexCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;

uniform mat4 transInvModel;

void main() {
  v_Normal = mat3(transInvModel) * a_Normal;
  v_FragPos = vec3(model * vec4(a_Pos, 1.0));
  v_TexCoord = a_TexCoord;

  gl_Position = proj * view * model * vec4(a_Pos, 1.0);
}