#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform sampler2D tMap;

varying vec2 vUv;

void main() {
    vec3 tex = texture2D(tMap, vUv).rgb;
    float d = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
    float v = d / fwidth(d);
    float alpha = clamp(v + 0.5, 0.0, 1.0);
    if(alpha < 0.01)
        discard;
    gl_FragColor.rgb = vec3(0.0);
    gl_FragColor.a = alpha;
}
