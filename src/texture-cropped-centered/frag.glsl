precision mediump float;
varying vec2 vuv;
uniform sampler2D texture;
void main() {
    gl_FragColor = texture2D(texture, vuv);
    gl_FragColor.xyz *= gl_FragColor.w;
}
