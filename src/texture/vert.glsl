precision mediump float;
attribute vec2 position;
attribute vec2 texc;
uniform vec2 view;
varying vec2 uv;
uniform vec4 camera;
void main() {
    uv = texc;
    if (camera.w == 0.0){
        vec2 pos = (position - camera.xy) * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    } else {
        mat2 rotation = mat2(cos(camera.w), -sin(camera.w), sin(camera.w), cos(camera.w));
        vec2 pos = (rotation * (position - camera.xy)) * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    }
}
