precision mediump float;
uniform vec2 center;
uniform float radius;
uniform vec2 view;
uniform vec4 camera;
uniform vec4 color;
varying vec2 v_position;
void main() {
    vec2 position = v_position * view / camera.z;
    vec2 cpos;
    if (camera.w == 0.0){
        // No rotation
        cpos = (center - camera.xy);
    } else {
        mat2 rotation = mat2(cos(camera.w), -sin(camera.w), sin(camera.w), cos(camera.w));
        cpos = (rotation * (center - camera.xy));
    }

    float distance = distance(position, cpos);
    if(distance > radius + 1.) {
        discard;
    }
    float alpha =  1. - smoothstep(radius - 1., radius + 1., distance);
    gl_FragColor = color * alpha;
    // gl_FragColor.a = alpha;
}
