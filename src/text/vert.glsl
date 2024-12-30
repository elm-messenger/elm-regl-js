attribute vec2 uv;
attribute vec3 position;

varying vec2 vUv;
uniform mat4 view;

void main() {
    vUv = uv;
    gl_Position = vec4((position.x) * 2. / 1920. - 1., (position.y + 1080.) * 2. / 1080. - 1., 0, 1.0);
}
