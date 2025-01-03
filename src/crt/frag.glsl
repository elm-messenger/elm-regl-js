precision mediump float;
uniform float scanline_count;
varying vec2 uv;
uniform sampler2D texture;
uniform vec2 view;

vec2 uv_curve(vec2 uv) {
	uv = (uv - 0.5) * 2.0;

	//You can modify the numbers and try different values
	uv.x *= 1.0 + pow(abs(uv.y) / 3.0, 2.0);
	uv.y *= 1.0 + pow(abs(uv.x) / 3.0, 2.0);

	//The scale part (you can delete it when you want)
	uv /= 1.2;

	uv = (uv / 2.0) + 0.5;
	return uv;
}

void main() {
	const float PI = 3.14159;
	//You can modify the *3.0, *-3.0 for a bigger or smaller 
	float r = texture2D(texture, uv_curve(uv) + vec2(0.0 / view.x), 0.0).r;
	float g = texture2D(texture, uv_curve(uv) + vec2(3.0 / view.x), 0.0).g;
	float b = texture2D(texture, uv_curve(uv) + vec2(-3.0 / view.x), 0.0).b;

	//If you dont want scanlines you can just delete this part
	float s = sin(uv_curve(uv).y * scanline_count * PI * 2.0);
	s = (s * 0.5 + 0.5) * 0.9 + 0.1;
	vec4 scan_line = vec4(vec3(pow(s, 0.25)), 1.0);

	gl_FragColor = vec4(r, g, b, 1.0) * scan_line;
}
