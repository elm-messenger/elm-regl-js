precision mediump float;
uniform sampler2D texture;
uniform float radius;
uniform float wRcp;
uniform float hRcp;
varying vec2 uv;
void main() {
    if (radius < 0.1) {
        gl_FragColor = texture2D(texture, uv);
        return;
    }
    vec4 avg = vec4(0.0);
    for(int x = -5; x <= 5; x++) {
        for(int y = -5; y <= 5; y++) {
            avg += (1.0 / 121.0) * texture2D(texture, uv + vec2(float(x) * radius * wRcp, float(y) * radius * hRcp));
        }
    }
    gl_FragColor = avg;
}
