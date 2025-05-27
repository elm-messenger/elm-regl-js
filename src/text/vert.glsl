attribute vec2 uv;
attribute vec2 position;
uniform vec2 view;
uniform vec2 offset;
varying vec2 vUv;
uniform vec4 camera;

void main() {
    vUv = uv;
    vec2 wpos = position + offset;
    if (camera.w == 0.0){
        // No rotation
        vec2 pos = (wpos - camera.xy) * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    } else {
        mat2 rotation = mat2(cos(camera.w), -sin(camera.w), sin(camera.w), cos(camera.w));
        vec2 pos = (rotation * (wpos - camera.xy)) * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    }
}
