precision mediump float;
uniform sampler2D texture;
uniform float alpha;
varying vec2 uv;
void main() {
    gl_FragColor = texture2D(texture, uv) * alpha;
    gl_FragColor.xyz *= gl_FragColor.w;
}
