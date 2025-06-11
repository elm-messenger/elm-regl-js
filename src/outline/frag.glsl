precision mediump float;

uniform sampler2D texture;
uniform float outline; // outline width
uniform vec2 view;
uniform vec4 color;

varying vec2 uv;

void main() {

   float alpha = texture2D(texture, uv).a;
   float maxAlpha = alpha;

   if (alpha != 0.0) {
        gl_FragColor = texture2D(texture, uv);
        return;
   }

    for (float i = 1.; i <= 10.; i++) {
        if (i > outline) {
            break;
        }
        for(float xo = -1.; xo < 1.5; xo+=1.){
            for(float yo = -1.; yo < 1.5; yo+=1.){
                vec2 pos = vec2(uv.x + xo * i * (.5/view.x), uv.y + yo*i * (-.5/view.y));
                maxAlpha = max(maxAlpha, texture2D(texture, pos).a);
            }
        }
    }
    if (alpha == 0.0 && maxAlpha > 0.0) {
        gl_FragColor = color;
    }else{
        gl_FragColor = texture2D(texture, uv);
    }

}
