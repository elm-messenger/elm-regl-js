#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform sampler2D tMap;
uniform float thickness;
uniform vec4 color;
uniform vec2 unitRange;
varying vec2 vUv;

float screenPxRange() {
    vec2 screenTexSize = vec2(1.0) / fwidth(vUv);
    return max(0.5 * dot(unitRange, screenTexSize), 1.0);
}

void main() {
    vec3 tex = texture2D(tMap, vUv).rgb;
    float d = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
    float screenPxDistance = screenPxRange() * d;
    float alpha = clamp(screenPxDistance + thickness, 0.0, 1.0);
    if(alpha < 0.01)
        discard;
    gl_FragColor.rgb = color.rgb * color.a * alpha;
    gl_FragColor.a = alpha * color.a;
}
