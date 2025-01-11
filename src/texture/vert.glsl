precision mediump float;
attribute vec2 position;
attribute vec2 texc;
uniform vec2 view;
varying vec2 uv;
void main() {
    uv = texc;
    gl_Position = vec4((position.x / view.x) * 2. - 1., 1. - (position.y / view.y) * 2. , 0, 1);
}
