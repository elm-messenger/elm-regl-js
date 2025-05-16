precision mediump float;
uniform float alpha;
varying vec2 vuv;
uniform sampler2D texture;
void main() {
    gl_FragColor = texture2D(texture, vuv) * alpha;
    gl_FragColor.xyz *= gl_FragColor.w;
}
