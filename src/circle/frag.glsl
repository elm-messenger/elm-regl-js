precision highp float;
uniform vec4 color;
varying vec2 v_position;
uniform vec3 cr;

void main() {
    float distance = distance(v_position, cr.xy);
    if(distance > cr.z + 1.) {
        discard;
    }
    float alpha =  1. - smoothstep(cr.z - 1., cr.z + 1., distance);
    gl_FragColor = vec4(color.rgb * color.a * alpha, alpha * color.a);
}
