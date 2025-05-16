precision mediump float;
varying vec2 vuv;
uniform sampler2D texture;
uniform float alpha;
void main() {
    gl_FragColor = texture2D(texture, vuv) * alpha;
    gl_FragColor.xyz *= gl_FragColor.w;
}
