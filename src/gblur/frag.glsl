precision mediump float;

uniform sampler2D texture;
uniform vec2 view;
varying vec2 uv;
uniform vec2 dir;
uniform float radius;

void main() {
    vec4 sum = vec4(0.0);

    float blurx = radius / (2. * view.x);
    float blury = radius / (2. * -view.y);
	float hstep = dir.x;
	float vstep = dir.y;
    
	sum += texture2D(texture, vec2(uv.x - 4.0*blurx*hstep, uv.y - 4.0*blury*vstep)) * 0.0162162162;
	sum += texture2D(texture, vec2(uv.x - 3.0*blurx*hstep, uv.y - 3.0*blury*vstep)) * 0.0540540541;
	sum += texture2D(texture, vec2(uv.x - 2.0*blurx*hstep, uv.y - 2.0*blury*vstep)) * 0.1216216216;
	sum += texture2D(texture, vec2(uv.x - 1.0*blurx*hstep, uv.y - 1.0*blury*vstep)) * 0.1945945946;
	
	sum += texture2D(texture, vec2(uv.x, uv.y)) * 0.2270270270;
	
	sum += texture2D(texture, vec2(uv.x + 1.0*blurx*hstep, uv.y + 1.0*blury*vstep)) * 0.1945945946;
	sum += texture2D(texture, vec2(uv.x + 2.0*blurx*hstep, uv.y + 2.0*blury*vstep)) * 0.1216216216;
	sum += texture2D(texture, vec2(uv.x + 3.0*blurx*hstep, uv.y + 3.0*blury*vstep)) * 0.0540540541;
	sum += texture2D(texture, vec2(uv.x + 4.0*blurx*hstep, uv.y + 4.0*blury*vstep)) * 0.0162162162;

    if (sum.a < 0.01) discard;
    gl_FragColor = vec4(sum.rgb, 1.0);
}
