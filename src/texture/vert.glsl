precision mediump float;
attribute vec2 position;
attribute vec2 texc;
uniform vec2 view;
varying vec2 uv;
uniform vec4 camera;
void main() {
    uv = texc;
    if(camera.w == 0.0) {
        vec2 pos = (position - camera.xy) * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    } else {
        vec2 diff = position - camera.xy;
        float cosW = cos(camera.w);
        float sinW = sin(camera.w);

        vec2 rotated = vec2(cosW * diff.x + sinW * diff.y, -sinW * diff.x + cosW * diff.y);

        vec2 pos = rotated * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    }
}
