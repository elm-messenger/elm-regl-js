precision mediump float;

attribute vec2 texc;
attribute vec2 texc2;
uniform vec4 posize;
uniform float angle;
uniform vec2 view;
varying vec2 vuv;
uniform vec4 camera;

void main() {
    vuv = texc;
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

    vec2 scaledVertex = texc2 * posize.zw;
    vec2 rotatedVertex = rotation * scaledVertex;

    vec2 worldPosition = posize.xy + rotatedVertex;

    if (camera.w == 0.0){
        vec2 pos = (worldPosition - camera.xy) * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    } else {
        mat2 rotation = mat2(cos(camera.w), -sin(camera.w), sin(camera.w), cos(camera.w));
        vec2 pos = (rotation * (worldPosition - camera.xy)) * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    }
}
