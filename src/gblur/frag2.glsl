precision mediump float;

#define KERNEL_SIZE 15
#define KERNEL_RADIUS ((KERNEL_SIZE - 1) / 2)

uniform sampler2D texture;
uniform float kernel[KERNEL_SIZE];  // precomputed 1D kernel
uniform vec2 view;
varying vec2 uv;

void main() {
    vec3 final_colour = vec3(0.0);
    float maxa = 0.0;

    for (int i = -KERNEL_RADIUS; i <= KERNEL_RADIUS; ++i) {
        float weight = kernel[KERNEL_RADIUS + i];
        vec2 offset = vec2(0.0, float(i) / view.y);
        vec4 c = texture2D(texture, uv + offset);
        final_colour += weight * c.rgb;
        maxa = max(maxa, c.a);
    }

    if (maxa < 0.01) discard;
    gl_FragColor = vec4(final_colour, maxa);
}
