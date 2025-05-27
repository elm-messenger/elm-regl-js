precision mediump float;

#define BLUR_RADIUS 3
#define KERNEL_SIZE (2 * BLUR_RADIUS + 1)

uniform sampler2D texture;
uniform float radius;
uniform vec2 view;
varying vec2 uv;

void main() {
    if (radius < 0.1) {
        gl_FragColor = texture2D(texture, uv);
        return;
    }

    vec4 avg = vec4(0.0);
    float maxa = 0.0;

    for (int i = -BLUR_RADIUS; i <= BLUR_RADIUS; i++) {
        vec2 offset = vec2(float(i) * radius / (2. * view.x), 0.0);
        vec4 c = texture2D(texture, uv + offset);
        avg += c / float(KERNEL_SIZE);
    }
    if (avg.a < 0.01){
        discard;
    }
    gl_FragColor = avg;

}
