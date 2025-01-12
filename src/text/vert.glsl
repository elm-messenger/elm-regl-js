attribute vec2 uv;
attribute vec2 position;
uniform vec2 view;
uniform vec2 offset;
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(((position.x + offset.x) / view.x) * 2. - 1., 1. - ((position.y + offset.y) / view.y) * 2., 0, 1);
}
