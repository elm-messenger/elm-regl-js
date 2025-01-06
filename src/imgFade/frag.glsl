precision mediump float;
uniform sampler2D t1;
uniform sampler2D t2;
uniform sampler2D mask;
uniform float t;
varying vec2 vuv;
void main() {
    float t0 = texture2D(mask, vec2(vuv.x, 1. - vuv.y)).x;
    t0 = t0 * .5 + .5;
    float a = smoothstep(-0.5, 0., (t - t0));
    gl_FragColor = mix(texture2D(t1, vuv), texture2D(t2, vuv), a);
}
