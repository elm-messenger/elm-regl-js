precision highp float;
uniform vec4 color;
varying vec2 v_position;
uniform vec4 cs;
uniform float radius;

void main() {
    if(abs(v_position.x - cs.x) > cs.z / 2.)
        discard;
    if(abs(v_position.y - cs.y) > cs.w / 2.)
        discard;

    vec2 lt = vec2(cs.x - cs.z + radius, cs.y - cs.w + radius);
    if(v_position.x < lt.x && v_position.y > lt.y) {
        // Left top
        float distance = distance(v_position, lt);
        if(distance > radius + 1.) {
            discard;
        }
        float alpha = 1. - smoothstep(radius - 1., radius + 1., distance);
        gl_FragColor = color * alpha;
        return;
    }
    vec2 rt = vec2(cs.x + cs.z - radius, cs.y - cs.w + radius);
    if(v_position.x > rt.x && v_position.y > rt.y) {
        // Right top
        float distance = distance(v_position, rt);
        if(distance > radius + 1.) {
            discard;
        }
        float alpha = 1. - smoothstep(radius - 1., radius + 1., distance);
        gl_FragColor = color * alpha;
        return;
    }
    vec2 lb = vec2(cs.x - cs.z + radius, cs.y + cs.w - radius);
    if(v_position.x < lb.x && v_position.y < lb.y) {
        // Left bottom
        float distance = distance(v_position, lb);
        if(distance > radius + 1.) {
            discard;
        }
        float alpha = 1. - smoothstep(radius - 1., radius + 1., distance);
        gl_FragColor = color * alpha;
        return;
    }
    vec2 rb = vec2(cs.x + cs.z - radius, cs.y + cs.w - radius);
    if(v_position.x > rb.x && v_position.y < rb.y) {
        // Right bottom
        float distance = distance(v_position, rb);
        if(distance > radius + 1.) {
            discard;
        }
        float alpha = 1. - smoothstep(radius - 1., radius + 1., distance);
        gl_FragColor = color * alpha;
        return;
    }

    // Center rectangle
    gl_FragColor = color;
}
