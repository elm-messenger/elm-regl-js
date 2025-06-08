precision mediump float;
attribute vec2 position;
varying vec2 v_position;
uniform vec2 view;
uniform vec4 camera;

void main() {
    v_position = position * view / camera.z;
    gl_Position = vec4(position, 0, 1);
}
