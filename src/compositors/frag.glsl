precision mediump float;
uniform sampler2D t1;
uniform sampler2D t2;
uniform int mode;
varying vec2 uv;
void main() {
    // gl_FragColor =  texture2D(t2, uv);
    // return;
    if(mode == 0) { // dst over src
        vec4 sourceColor = texture2D(t1, uv);
        vec4 destColor = texture2D(t2, uv);
        gl_FragColor = destColor * destColor.a + sourceColor * (1.0 - destColor.a);
        return;
    }
    if(mode == 1) { // mask by src
        vec4 sourceColor = texture2D(t1, uv);
        vec4 destColor = texture2D(t2, uv);
        gl_FragColor = destColor * sourceColor.a;
        return;
    }
}
