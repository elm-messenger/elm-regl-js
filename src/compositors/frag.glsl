precision mediump float;
uniform sampler2D t1;
uniform sampler2D t2;
uniform int mode;
varying vec2 uv;
void main() {
    if (mode == 0) { // Source over
        vec4 sourceColor = texture2D(t1, uv);
        vec4 destColor = texture2D(t2, uv);
        // Source over composition formula
        gl_FragColor = sourceColor * sourceColor.a + destColor * (1.0 - sourceColor.a);
        return;
    }
}
