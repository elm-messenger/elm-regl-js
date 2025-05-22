precision mediump float;
attribute vec2 position;
uniform vec2 view;
uniform vec4 camera;
void main() {
    if (camera.w == 0){
        // No rotation
        vec2 pos = (position - camera.xy) * camera.z;
    } else {
        mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        vec2 pos = (rotation * (position - camera.xy)) * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    }
}
