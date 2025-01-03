precision mediump float;
uniform sampler2D texture;
uniform float sigma;
uniform float wRcp;
uniform float hRcp;
varying vec2 uv;

float normpdf(in float x, in float sigma) {
  return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

void main() {
  if(sigma < .1) {
    gl_FragColor = texture2D(texture, uv);
    return;
  }
  const int mSize = 15;
  const int kSize = (mSize - 1) / 2;
  float kernel[mSize];
  vec3 final_colour = vec3(0.0);
  float maxa = 0.0;
  float Z = 0.0;
  for(int j = 0; j <= kSize; ++j) {
    kernel[kSize + j] = kernel[kSize - j] = normpdf(float(j), sigma);
  }
  for(int j = 0; j < mSize; ++j) {
    Z += kernel[j];
  }
  for(int i = -kSize; i <= kSize; ++i) {
    for(int j = -kSize; j <= kSize; ++j) {
      vec4 c = texture2D(texture, uv + vec2(float(i) * wRcp, float(j) * hRcp));
      final_colour += kernel[kSize + j] * kernel[kSize + i] * c.rgb;
      maxa = max(maxa, c.a);
    }
  }
  gl_FragColor = vec4(final_colour / (Z * Z), maxa);
}
