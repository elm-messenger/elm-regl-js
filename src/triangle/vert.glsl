precision mediump float;
attribute vec2 position;
uniform vec2 view;
void main() {
    gl_Position = vec4((position.x / view.x) * 2. - 1., (position.y / view.y) * 2. - 1., 0, 1);
}
