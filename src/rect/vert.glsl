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
        // Rotate and scale the vertex
        mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        rotatedVertex = rotation * scaledVertex;
    }

    // Translate to the rectangle's position
    vec2 wpos = posize.xy + rotatedVertex;


    if (camera.w == 0.0){
        // No rotation
        vec2 pos = (wpos - camera.xy) * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    } else {
        mat2 rotation = mat2(cos(camera.w), -sin(camera.w), sin(camera.w), cos(camera.w));
        vec2 pos = (rotation * (wpos - camera.xy)) * camera.z / view;
        gl_Position = vec4(pos, 0, 1);
    }

    // // Transform to OpenGL clip space
    // vec2 clipPosition = vec2((worldPosition.x / view.x) * 2.0 - 1.0, 1. - (worldPosition.y / view.y) * 2.0);

    // gl_Position = vec4(clipPosition, 0.0, 1.0);

}
