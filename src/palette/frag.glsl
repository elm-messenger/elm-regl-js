precision mediump float;
uniform sampler2D texture;
varying vec2 uv;
// #define R 5
void main() {
    // float W = float((1 + 2 * R) * (1 + 2 * R));
    // float wRcp = 1.0 / 1280.;
    // float hRcp = 1.0 / 720.;
    // vec3 avg = vec3(0.0);
    // for(int x = -R; x <= +R; x++) {
    //     for(int y = -R; y <= +R; y++) {
    //         avg += (1.0 / W) * texture2D(texture, uv + vec2(float(x) * wRcp, float(y) * hRcp)).xyz;
    //     }
    // }
    // gl_FragColor = vec4(avg, 1.0);
    gl_FragColor = texture2D(texture, uv);
}
