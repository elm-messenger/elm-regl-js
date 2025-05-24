precision mediump float;
uniform sampler2D texture;
uniform float radius;
uniform vec2 view;
varying vec2 uv;

void main() {
    if (radius < 0.1) {
        gl_FragColor = texture2D(texture, uv);
        return;
    }

    vec3 avg = vec3(0.0);
    float maxa = 0.0;

    for (int i = -5; i <= 5; i++) {
        vec2 offset = vec2(float(i) * radius / view.x, 0.0);
        vec4 c = texture2D(texture, uv + offset);
        avg += c.rgb / 11.0;
        maxa = max(maxa, c.a);
    }

    if (maxa < 0.01) discard;
    gl_FragColor = vec4(avg, maxa);
}
