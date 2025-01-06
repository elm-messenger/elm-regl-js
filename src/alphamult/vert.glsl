precision mediump float;
attribute vec2 texc;
varying vec2 uv;
void main() {
    uv = texc;
    gl_Position = vec4(texc * 2. - 1., 0, 1);
}
