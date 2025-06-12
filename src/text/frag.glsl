#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform sampler2D tMap;
uniform vec2 topt;
uniform vec4 color;
uniform vec4 ocolor;
uniform vec2 unitRange;
varying vec2 vUv;

float screenPxRange() {
    vec2 screenTexSize = vec2(1.0) / fwidth(vUv);
    return max(0.5 * dot(unitRange, screenTexSize), 1.0);
}

void main() {
    vec4 nc = vec4(color.rgb * color.a, color.a);
    float thickness = topt.x;
    float outline = topt.y;
    vec3 tex = texture2D(tMap, vUv).rgb;
    float d = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
    float bodyDist = screenPxRange() * d;
    float alpha = clamp(bodyDist + thickness, 0.0, 1.0);
    if (outline > 0.) {
        vec4 outlineColor = vec4(ocolor.rgb * ocolor.a, ocolor.a);
        float outlineAlpha = clamp(bodyDist + thickness + outline, 0.0, 1.0);
        if(outlineAlpha < 0.01) discard;
        vec3 mcolor;
        float nalpha;
        if (alpha > 0.5) {
            mcolor = nc.rgb * alpha;
            nalpha = alpha * nc.a;
        } else {
            mcolor = outlineColor.rgb * outlineAlpha;
            nalpha = outlineAlpha * outlineColor.a;
        }

        gl_FragColor = vec4(mcolor, nalpha);
    } else {
        if(alpha < 0.01) discard;
        gl_FragColor = nc * alpha;
    }
}
