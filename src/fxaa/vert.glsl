precision mediump float;

varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

uniform vec2 view;
attribute vec2 position;
varying vec2 vUv;

void texcoords(
    vec2 fragCoord,
    vec2 resolution,
    out vec2 v_rgbNW,
    out vec2 v_rgbNE,
    out vec2 v_rgbSW,
    out vec2 v_rgbSE,
    out vec2 v_rgbM
) {
    vec2 inverseVP = 1.0 / resolution.xy;
    v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
    v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
    v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
    v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
    v_rgbM = vec2(fragCoord * inverseVP);
}

void main(void) {
    gl_Position = vec4(position, 1.0, 1.0);

    vUv = (position + 1.0) * 0.5;
    vec2 fragCoord = vUv * view;
    texcoords(fragCoord, view, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
}
