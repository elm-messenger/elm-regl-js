precision highp float;
uniform vec4 color;
varying vec2 v_position;
uniform vec4 cs;
uniform float radius;

void main() {
    vec4 nc = vec4(color.rgb * color.a, color.a);
    float hw = cs.z / 2.;
    float hh = cs.w / 2.;
    if(abs(v_position.x - cs.x) > hw)
        discard;
    if(abs(v_position.y - cs.y) > hh)
        discard;

    vec2 lt = vec2(cs.x - hw + radius, cs.y - hh + radius);
    if(v_position.x < lt.x && v_position.y < lt.y) {
        float distance = distance(v_position, lt);
        if(distance > radius + 1.) {
            discard;
        }
        float alpha = 1. - smoothstep(radius - 1., radius + 1., distance);
        gl_FragColor = nc * alpha;
        return;
    }
    vec2 rt = vec2(cs.x + hw - radius, cs.y - hh + radius);
    if(v_position.x > rt.x && v_position.y < rt.y) {
        float distance = distance(v_position, rt);
        if(distance > radius + 1.) {
            discard;
        }
        float alpha = 1. - smoothstep(radius - 1., radius + 1., distance);
        gl_FragColor = nc * alpha;
        return;
    }
    vec2 lb = vec2(cs.x - hw + radius, cs.y + hh - radius);
    if(v_position.x < lb.x && v_position.y > lb.y) {
        float distance = distance(v_position, lb);
        if(distance > radius + 1.) {
            discard;
        }
        float alpha = 1. - smoothstep(radius - 1., radius + 1., distance);
        gl_FragColor = nc * alpha;
        return;
    }
    vec2 rb = vec2(cs.x + hw - radius, cs.y + hh - radius);
    if(v_position.x > rb.x && v_position.y > rb.y) {
        float distance = distance(v_position, rb);
        if(distance > radius + 1.) {
            discard;
        }
        float alpha = 1. - smoothstep(radius - 1., radius + 1., distance);
        gl_FragColor = nc * alpha;
        return;
    }

    // Center rectangle
    gl_FragColor = nc;
}
