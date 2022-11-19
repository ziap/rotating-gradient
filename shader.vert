attribute vec2 a_vertex;
attribute float a_interp;

uniform vec2 u_scale;
uniform vec4 u_color1;
uniform vec4 u_color2;

varying vec4 v_color;

void main() {
  gl_Position = vec4(a_vertex, 0.0, 1.0);
  v_color = u_color1 + (u_color2 - u_color1) * 0.5 * (1.0 + a_interp);
}
