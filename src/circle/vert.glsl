precision mediump float;
attribute vec2 position;
varying vec2 v_position;
uniform vec2 view;
uniform vec4 camera;

void main() {
    vec2 tp = position * view / camera.z;
    if(camera.w == 0.0) {
        v_position = tp + camera.xy;
    } else {
        float cosW = cos(camera.w);
        float sinW = sin(camera.w);

        vec2 rotated = vec2(cosW * tp.x - sinW * tp.y, sinW * tp.x + cosW * tp.y);

        v_position = rotated + camera.xy;
    }
    gl_Position = vec4(position, 0, 1);
}
