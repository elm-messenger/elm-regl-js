precision mediump float;
attribute vec2 position;
uniform mat4 view;
void main() {
    gl_Position = view * vec4(position, 0, 1);
}
