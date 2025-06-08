attribute vec2 uv;
attribute vec2 position;
uniform vec2 view;
uniform vec2 offset;
varying vec2 vUv;
uniform vec4 camera;

void main() {
    vUv = uv;
    vec2 wpos = position + offset;
    if(camera.w == 0.0) {
        vec2 pos = (wpos - camera.xy) * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    } else {
        vec2 diff = wpos - camera.xy;
        float cosW = cos(camera.w);
        float sinW = sin(camera.w);

        vec2 rotated = vec2(cosW * diff.x + sinW * diff.y, -sinW * diff.x + cosW * diff.y);

        vec2 pos = rotated * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    }
}
