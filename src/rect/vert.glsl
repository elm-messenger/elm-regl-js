precision mediump float;

attribute vec2 position;
uniform vec4 posize;
uniform float angle;
uniform vec2 view;
uniform vec4 camera;

void main() {
    vec2 scaledVertex = (position - 0.5) * posize.zw;
    vec2 rotatedVertex = scaledVertex;

    if(angle != 0.) {
        float cosA = cos(angle);
        float sinA = sin(angle);
        rotatedVertex = vec2(cosA * scaledVertex.x + sinA * scaledVertex.y, -sinA * scaledVertex.x + cosA * scaledVertex.y);
    }

    vec2 wpos = posize.xy + rotatedVertex;

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
