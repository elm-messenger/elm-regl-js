precision mediump float;
attribute vec2 position;
attribute vec2 texc;
uniform vec2 offset;
varying vec2 uv;
void main() {
    uv = texc;
    gl_Position = vec4(position , 0, 1);
}
