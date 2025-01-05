precision mediump float;
uniform sampler2D texture;
varying vec2 uv;
void main() {
    gl_FragColor = texture2D(texture, uv);
    gl_FragColor.xyz *= gl_FragColor.w;
}
