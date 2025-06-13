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
    vec4 nc = vec4(color.rgb * color.a, color.a);
    vec3 tex = texture2D(tMap, vUv).rgb;
    float d = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
    float bodyDist = screenPxRange() * d;
    float alpha = clamp(bodyDist + thickness, 0.0, 1.0);

    if(alpha < 0.01)
        discard;
    gl_FragColor = nc * alpha;
}
