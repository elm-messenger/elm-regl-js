precision mediump float;
uniform sampler2D texture;
uniform float radius;
uniform vec2 view;
varying vec2 uv;
void main() {
    if(radius < 0.1) {
        gl_FragColor = texture2D(texture, uv);
        return;
    }
    vec3 avg = vec3(0.0);
    float maxa = 0.0;
    for(int x = -5; x <= 5; x++) {
        for(int y = -5; y <= 5; y++) {
            vec4 c = texture2D(texture, uv + vec2(float(x) * radius / view.x, float(y) * radius / view.y));
            avg += (1.0 / 121.0) * c.xyz;
            maxa = max(maxa, c.a);
        }
    }
    if (maxa < 0.01) {
        discard;
    }
    gl_FragColor = vec4(avg, maxa);
}
