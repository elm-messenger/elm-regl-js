precision mediump float;
uniform sampler2D t1;
uniform sampler2D t2;
uniform sampler2D mask;
uniform float t;
uniform int invert_mask;
varying vec2 uv;
void main() {
    float t0 = texture2D(mask, uv).x;
    if(invert_mask == 1) {
        t0 = 1. - t0;
    }
    t0 = t0 * .5 + .5;
    float a = smoothstep(-0.5, 0., (t - t0));
    gl_FragColor = mix(texture2D(t1, uv), texture2D(t2, uv), a);
}
