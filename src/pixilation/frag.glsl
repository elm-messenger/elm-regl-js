precision mediump float;
uniform sampler2D texture;
uniform float alpha;
uniform vec2 view;
uniform float pixelSize;
varying vec2 uv;
void main() {
    vec2 res = vec2(view.x*2., -view.y*2.);
    vec2 puv = floor(uv * res/pixelSize)*pixelSize/res;
    gl_FragColor = texture2D(texture, puv);
}
