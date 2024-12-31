precision mediump float;
uniform sampler2D texture;
// uniform float radius;
uniform float wRcp;
uniform float hRcp;
varying vec2 uv;
#define FRAG 5.
#define radius 5.
void main() {
    float W = (1. + 2. * radius) * (1. + 2. * radius);
    vec3 avg = vec3(0.0);
    for(float x = -radius; x <= radius; x += radius / FRAG) {
        for(float y = -radius; y <= radius; y += radius / FRAG) {
            avg += (1.0 / W) * texture2D(texture, uv + vec2(x * wRcp, y * hRcp)).xyz;
        }
    }
    gl_FragColor = vec4(avg, 1.0);
}
