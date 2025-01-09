#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform sampler2D tMap;
uniform float thickness;
uniform vec4 color;
varying vec2 vUv;

void main() {
    vec3 tex = texture2D(tMap, vUv).rgb;
    float d = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
    float v = d / fwidth(d);
    float alpha = clamp(v + thickness, 0.0, 1.0);
    if(alpha < 0.01)
        discard;
    gl_FragColor.rgb = color.rgb * color.a;
    gl_FragColor.a = alpha * color.a;
}
