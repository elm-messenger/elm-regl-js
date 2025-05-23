precision mediump float;

attribute vec2 texc;
uniform vec4 posize;
uniform float angle;
uniform vec2 view;
varying vec2 vuv;
uniform vec4 camera;

void main() {
    vuv = vec2(texc.x, 1. - texc.y);
    vec2 scaledVertex = (texc - 0.5) * posize.zw;
    vec2 rotatedVertex = scaledVertex;
    if(angle != 0.0) {
        mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        rotatedVertex = rotation * scaledVertex;
    }

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
