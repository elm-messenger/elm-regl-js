attribute vec2 uv;
attribute vec3 position;

varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = vec4(position.x/16.0*4.0, position.y/9.0*4.0+0.5, position.z, 1.0);
}
