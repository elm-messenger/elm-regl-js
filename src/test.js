const regl = require('regl')()

require('resl')({
    manifest: {
        myimg: {
            type: 'image',
            src: 'build/enemy.png',
            parser: (data) => regl.texture({
                mag: 'linear',
                data: data
            })
        },
    },
    onDone: ({ myimg }) => {

        regl.clear({
            color: [0, 0, 0, 1],
            depth: 1
        })
        regl({
            frag: `
            precision mediump float;
            uniform sampler2D texture;
            varying vec2 uv;
            void main () {
              gl_FragColor = texture2D(texture, uv);
            }`,

            vert: `
            precision mediump float;
            attribute vec2 position;
            varying vec2 uv;
            void main () {
              uv = vec2(1.0 - position.x, position.y);
              gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
            }`,

            attributes: {
                position: [
                    -2, 0,
                    0, -2,
                    2, 2]
            },

            uniforms: {
                texture: myimg
            },

            count: 3
        })()
    }

})  
