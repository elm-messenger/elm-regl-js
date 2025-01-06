precision mediump float;
uniform sampler2D t1;
uniform sampler2D t2;
uniform float t;
uniform int mode;
varying vec2 uv;
void main() {
    if(mode == 0) { // Fade out
        vec4 t1c = texture2D(t1, uv);
        vec4 t2c = texture2D(t2, uv);
        gl_FragColor = mix(t1c, t2c, t);
        return;
    }
}
