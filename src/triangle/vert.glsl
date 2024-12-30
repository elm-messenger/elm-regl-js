precision mediump float;
attribute vec2 position;
uniform mat4 view;
void main() {
    gl_Position = view * vec4(position, 0, 1);
    // gl_Position = vec4(position.x * 2. / 1280. - 1., position.y * 2. / 720. - 1., 0, 1);
}
