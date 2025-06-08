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

    vec2 scaledVertex = texc2 * posize.zw;
    float cosA = cos(angle);
    float sinA = sin(angle);

    vec2 rotatedVertex = vec2(cosA * scaledVertex.x + sinA * scaledVertex.y, -sinA * scaledVertex.x + cosA * scaledVertex.y);

    vec2 worldPosition = posize.xy + rotatedVertex;

    if(camera.w == 0.0) {
        vec2 pos = (worldPosition - camera.xy) * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    } else {
        vec2 diff = worldPosition - camera.xy;
        float cosW = cos(camera.w);
        float sinW = sin(camera.w);

        vec2 rotated = vec2(cosW * diff.x + sinW * diff.y, -sinW * diff.x + cosW * diff.y);

        vec2 pos = rotated * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    }
}
