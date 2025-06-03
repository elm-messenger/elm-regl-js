let regl = null;
const readFileSync = require('fs').readFileSync;
const TM = require('./text.js');

const loadedPrograms = {};

const loadedTextures = {};

let TextManager = null;

let ElmApp = null;

let gview = null;

let global_error = 0;

// X, Y, Scale, Rotation
let camera = [0.0, 0.0, 1.0, 0.0];

let resolver = null;

let userConfig = {
    interval: 0,
    virtWidth: 1920,
    virtHeight: 1080,
    fboNum: 10
};

let fbos = [];

let palettes = [];

let freePalette = [];

let drawPalette = null;

let browserSupportNow = (
    window.performance &&
    window.performance.now &&
    window.performance.timeOrigin
);

let navigationStartTime = browserSupportNow ? window.performance.timeOrigin : 0;

const frags = {
    "triangle": readFileSync('src/triangle/frag.glsl', 'utf8'),
    "rect": readFileSync('src/rect/frag.glsl', 'utf8'),
    "texture": readFileSync('src/texture/frag.glsl', 'utf8'),
    "texture-centered": readFileSync('src/texture-centered/frag.glsl', 'utf8'),
    "texture-cropped-centered": readFileSync('src/texture-cropped-centered/frag.glsl', 'utf8'),
    "text": readFileSync('src/text/frag.glsl', 'utf8'),
    "compositor": readFileSync('src/compositors/frag.glsl', 'utf8'),
    "compFade": readFileSync('src/compFade/frag.glsl', 'utf8'),
    "imgFade": readFileSync('src/imgFade/frag.glsl', 'utf8'),
    "blur1": readFileSync('src/blur/frag1.glsl', 'utf8'),
    "blur2": readFileSync('src/blur/frag2.glsl', 'utf8'),
    "gblur": readFileSync('src/gblur/frag.glsl', 'utf8'),
    "crt": readFileSync('src/crt/frag.glsl', 'utf8'),
    "fxaa": readFileSync('src/fxaa/frag.glsl', 'utf8'),
    "alphamult": readFileSync('src/alphamult/frag.glsl', 'utf8'),
    "circle": readFileSync('src/circle/frag.glsl', 'utf8')
}

const verts = {
    "triangle": readFileSync('src/triangle/vert.glsl', 'utf8'),
    "rect": readFileSync('src/rect/vert.glsl', 'utf8'),
    "texture": readFileSync('src/texture/vert.glsl', 'utf8'),
    "texture-centered": readFileSync('src/texture-centered/vert.glsl', 'utf8'),
    "texture-cropped-centered": readFileSync('src/texture-cropped-centered/vert.glsl', 'utf8'),
    "text": readFileSync('src/text/vert.glsl', 'utf8'),
    "compositor": readFileSync('src/compositors/vert.glsl', 'utf8'),
    "compFade": readFileSync('src/compFade/vert.glsl', 'utf8'),
    "imgFade": readFileSync('src/imgFade/vert.glsl', 'utf8'),
    "blur": readFileSync('src/blur/vert.glsl', 'utf8'),
    "gblur": readFileSync('src/gblur/vert.glsl', 'utf8'),
    "crt": readFileSync('src/crt/vert.glsl', 'utf8'),
    "fxaa": readFileSync('src/fxaa/vert.glsl', 'utf8'),
    "alphamult": readFileSync('src/alphamult/vert.glsl', 'utf8'),
    "circle": readFileSync('src/circle/vert.glsl', 'utf8'),
}

function stopError(e) {
    global_error = 1;
    console.error(e);
    document.body.textContent = "Error: " + e.message + "\n\n" +
        "Please check the console for more details.";
}

const quad = () => [
    (x) => x
    , regl({
        frag: frags["triangle"],
        vert: verts["triangle"],
        attributes: {
            position: regl.prop('pos')
        },
        uniforms: {
            color: regl.prop('color')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })]

const rect = () => [
    (x) => x
    , regl({
        frag: frags["rect"],
        vert: verts["rect"],
        attributes: {
            position: [
                0, 1,
                1, 1,
                1, 0,
                0, 0,
            ]
        },
        uniforms: {
            posize: regl.prop('posize'),
            angle: regl.prop('angle'),
            color: regl.prop('color')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })]

const triangle = () => [
    (x) => x,
    regl({
        frag: frags["triangle"],
        vert: verts["triangle"],
        attributes: {
            position: regl.prop('pos')
        },
        uniforms: {
            color: regl.prop('color')
        },
        count: 3
    })]


const poly = () => [
    (x) => {
        if (!("prim" in x)) {
            x["prim"] = "triangles";
        }
        return x;
    },
    regl({
        frag: frags["triangle"],
        vert: verts["triangle"],
        attributes: {
            position: regl.prop('pos')
        },
        uniforms: {
            color: regl.prop('color')
        },
        elements: regl.prop('elem'),
        primitive: regl.prop('prim'),
    })]

const texture = () => [
    (x) => {
        const src = x["texture"];
        if (!x["alpha"]) {
            x["alpha"] = 1.0;
        }
        if (!loadedTextures[src]) {
            return null;
        }
        x["texture"] = loadedTextures[src];
        return x;
    },
    regl({
        frag: frags["texture"],
        vert: verts["texture"],
        attributes: {
            texc: [
                0, 1,
                1, 1,
                1, 0,
                0, 0,
            ],
            position: regl.prop('pos')
        },
        uniforms: {
            texture: regl.prop('texture'),
            alpha: regl.prop('alpha')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6,
    })]

const textureCropped = () => [
    (x) => {
        if (!x["alpha"]) {
            x["alpha"] = 1.0;
        }
        const src = x["texture"];
        if (!loadedTextures[src]) {
            return null;
        }
        x["texture"] = loadedTextures[src];
        return x;
    },
    regl({
        frag: frags["texture"],
        vert: verts["texture"],
        attributes: {
            texc: regl.prop('texc'),
            position: regl.prop('pos')
        },
        uniforms: {
            texture: regl.prop('texture'),
            alpha: regl.prop('alpha')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6,
    })]

const centeredTexture = () => [
    (x) => {
        if (!x["alpha"]) {
            x["alpha"] = 1.0;
        }
        const src = x["texture"];
        if (!loadedTextures[src]) {
            return null;
        }
        x["texture"] = loadedTextures[src];
        return x;
    },
    regl({
        frag: frags["texture-centered"],
        vert: verts["texture-centered"],
        attributes: {
            texc: [
                0, 1,
                1, 1,
                1, 0,
                0, 0,
            ]
        },
        uniforms: {
            texture: regl.prop('texture'),
            posize: regl.prop('posize'),
            angle: regl.prop('angle'),
            alpha: regl.prop('alpha')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6,
    })]

const centeredCroppedTexture = () => [
    (x) => {
        if (!x["alpha"]) {
            x["alpha"] = 1.0;
        }
        const src = x["texture"];
        if (!loadedTextures[src]) {
            return null;
        }
        x["texture"] = loadedTextures[src];
        const x1 = x["texc"][0];
        const y1 = x["texc"][1];
        const w = x["texc"][2];
        const h = x["texc"][3];
        x["texc"] = [
            x1, y1,
            x1 + w, y1,
            x1 + w, y1 + h,
            x1, y1 + h
        ];
        return x;
    },
    regl({
        frag: frags["texture-cropped-centered"],
        vert: verts["texture-cropped-centered"],
        attributes: {
            texc: regl.prop('texc'),
            texc2: [
                -0.5, 0.5,
                0.5, 0.5,
                0.5, -0.5,
                -0.5, -0.5,
            ]
        },
        uniforms: {
            texture: regl.prop('texture'),
            posize: regl.prop('posize'),
            angle: regl.prop('angle'),
            alpha: regl.prop('alpha')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6,
    })]

const textbox = () => [
    (x) => {
        if (x.font) {
            x.fonts = [x.font];
        }
        if (x["width"] && x["width"] <= 0) {
            x["width"] = Infinity;
        }
        const res = TextManager.makeText(x);
        x.tMap = TextManager.getTexFromFont(x);
        x.position = res.position;
        x.uv = res.uv;
        x.elem = res.index;
        x.thickness = x.thickness ? x.thickness : 0.5;
        x.unitRange = TextManager.getFont(x.fonts[0]).text.unitRange;
        return x;
    },
    regl({
        frag: frags["text"],
        vert: verts["text"],
        attributes: {
            position: regl.prop('position'),
            uv: regl.prop('uv')
        },
        uniforms: {
            tMap: regl.prop('tMap'),
            offset: regl.prop('offset'),
            color: regl.prop('color'),
            thickness: regl.prop('thickness'),
            unitRange: regl.prop('unitRange'),
        },
        elements: regl.prop('elem'),
        depth: { enable: false }
    })
]

const defaultCompositor = () => [
    x => x,
    regl({
        frag: frags["compositor"],
        vert: verts["compositor"],
        attributes: {
            texc: [
                1, 1,
                1, 0,
                0, 0,
                0, 1,]
        },
        uniforms: {
            mode: regl.prop('mode'),
            t1: regl.prop('t1'),
            t2: regl.prop('t2')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })
]

const compFade = () => [
    x => x,
    regl({
        frag: frags["compFade"],
        vert: verts["compFade"],
        attributes: {
            texc: [
                1, 1,
                1, 0,
                0, 0,
                0, 1,]
        },
        uniforms: {
            mode: regl.prop('mode'),
            t: regl.prop('t'),
            t1: regl.prop('t1'),
            t2: regl.prop('t2')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })
]

const imgFade = () => [
    x => {
        const src = x["mask"];
        if (!loadedTextures[src]) {
            return null;
        }
        x["mask"] = loadedTextures[src];
        return x;
    },
    regl({
        frag: frags["imgFade"],
        vert: verts["imgFade"],
        attributes: {
            texc: [
                1, 1,
                1, 0,
                0, 0,
                0, 1,]
        },
        uniforms: {
            mask: regl.prop('mask'),
            t: regl.prop('t'),
            t1: regl.prop('t1'),
            t2: regl.prop('t2'),
            invert_mask: regl.prop('invert_mask')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })
]

const blurh = () => [
    x => x,
    regl({
        frag: frags["blur1"],
        vert: verts["blur"],
        attributes: {
            texc: [
                1, 1,
                1, 0,
                0, 0,
                0, 1,]
        },
        uniforms: {
            radius: regl.prop('radius'),
            texture: regl.prop('texture')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })
]

const blurv = () => [
    x => x,
    regl({
        frag: frags["blur2"],
        vert: verts["blur"],
        attributes: {
            texc: [
                1, 1,
                1, 0,
                0, 0,
                0, 1,]
        },
        uniforms: {
            radius: regl.prop('radius'),
            texture: regl.prop('texture')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })
]


const gblurh = () => [
    x => x,
    regl({
        frag: frags["gblur"],
        vert: verts["gblur"],
        attributes: {
            texc: [
                1, 1,
                1, 0,
                0, 0,
                0, 1,]
        },
        uniforms: {
            dir: [1, 0],
            texture: regl.prop('texture'),
            radius: regl.prop('radius')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })
]


const gblurv = () => [
    x => x,
    regl({
        frag: frags["gblur"],
        vert: verts["gblur"],
        attributes: {
            texc: [
                1, 1,
                1, 0,
                0, 0,
                0, 1,]
        },
        uniforms: {
            dir: [0, 1],
            texture: regl.prop('texture'),
            radius: regl.prop('radius')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })
]

const crt = () => [
    x => x,
    regl({
        frag: frags["crt"],
        vert: verts["crt"],
        attributes: {
            texc: [
                1, 1,
                1, 0,
                0, 0,
                0, 1,]
        },
        uniforms: {
            texture: regl.prop('texture'),
            scanline_count: regl.prop('count')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })
]

const fxaa = () => [
    x => x,
    regl({
        frag: frags["fxaa"],
        vert: verts["fxaa"],
        attributes: {
            position: [
                -1, 1,
                -1, -1,
                1, -1,
                1, 1,]
        },
        uniforms: {
            texture: regl.prop('texture')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })
]

const alphamult = () => [
    x => x,
    regl({
        frag: frags["alphamult"],
        vert: verts["alphamult"],
        attributes: {
            texc: [
                1, 1,
                1, 0,
                0, 0,
                0, 1,]
        },
        uniforms: {
            texture: regl.prop('texture'),
            alpha: regl.prop('alpha')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })
]

const circle = () => [
    x => x,
    regl({
        frag: frags["circle"],
        vert: verts["circle"],
        attributes: {
            position: [
                -1, -1,
                1, -1,
                1, 1,
                -1, 1,
            ]
        },
        uniforms: {
            center: regl.prop('center'),
            radius: regl.prop('radius'),
            color: regl.prop('color')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],

        count: 6
    })
]

const programs = {
    triangle,
    textbox,
    quad,
    rect,
    circle,
    poly,
    texture,
    textureCropped,
    centeredTexture,
    centeredCroppedTexture,
    // Effects
    blurh,
    blurv,
    gblurh,
    gblurv,
    crt,
    fxaa,
    alphamult,
    // Compositors
    defaultCompositor,
    compFade,
    imgFade,
}

function loadTextureREGL(texture_name, opts, w, h) {
    loadedTextures[texture_name] = regl.texture(opts);
    // Response to Elm
    const response = {
        texture: texture_name,
        width: w,
        height: h
    }
    ElmApp.ports.recvREGLCmd.send({
        _c: "loadTexture",
        response
    });
}

function loadTexture(texture_name, opts) {
    // Initialize textures
    const image = new Image();
    image.src = opts.data;
    image.onload = () => {
        if (opts["subimg"]) {
            const subimg = opts["subimg"];
            createImageBitmap(image, subimg[0], subimg[1], subimg[2], subimg[3], { imageOrientation: "flipY", premultiplyAlpha: 'none' }).then((sp) => {
                opts.data = sp;
                loadTextureREGL(texture_name, opts, subimg[2], subimg[3]);
            })
        } else {
            opts.data = image;
            opts.flipY = true;
            loadTextureREGL(texture_name, opts, image.width, image.height);
        }
    }
    image.onerror = () => {
        throw new Error("Error loading texture: " + image.src);
    }
}


function createGLProgram(prog_name, proto) {
    if (loadedPrograms[prog_name]) {
        throw new Error("Program already exists: " + prog_name);
    }
    // console.log("Creating program: " + prog_name);
    const uniforms = proto.uniforms ? proto.uniforms : {};
    const attributes = proto.attributes ? proto.attributes : {};
    const uniformTextureKeys = proto.uniformsDynTexture ? Object.keys(proto.uniformsDynTexture) : [];
    const initfunc = (x) => {
        for (let i = 0; i < uniformTextureKeys.length; i++) {
            const key = uniformTextureKeys[i];
            if (key in x) {
                if (!(x[key] in loadedTextures)) {
                    return null;
                }
                x[key] = loadedTextures[x[key]];
            }
        }
        return x;
    }
    if (proto.uniformsDyn) {
        for (const key of Object.keys(proto.uniformsDyn)) {
            uniforms[key] = regl.prop(proto.uniformsDyn[key]);
        }
    }
    if (proto.uniformsDynTexture) {
        for (const key of Object.keys(proto.uniformsDynTexture)) {
            uniforms[key] = regl.prop(proto.uniformsDynTexture[key]);
        }
    }
    if (proto.attributesDyn) {
        for (const key of Object.keys(proto.attributesDyn)) {
            attributes[key] = regl.prop(proto.attributesDyn[key]);
        }
    }
    if (proto.elementsDyn) {
        proto.elements = regl.prop(proto.elementsDyn);
    }
    if (proto.primitiveDyn) {
        proto.primitive = regl.prop(proto.primitiveDyn);
    }
    if (proto.countDyn) {
        proto.count = regl.prop(proto.countDyn);
    }
    const genP = {
        frag: proto.frag,
        vert: proto.vert
    }
    if (proto.attributes) {
        genP.attributes = attributes;
    }
    if (proto.count) {
        genP.count = proto.count;
    }
    if (proto.elements) {
        genP.elements = proto.elements;
    }
    if (proto.uniforms) {
        genP.uniforms = uniforms;
    }
    if (proto.primitive) {
        genP.primitive = proto.primitive;
    }
    const program = regl(genP);
    loadedPrograms[prog_name] = [initfunc, program];
    const response = {
        name: prog_name
    }
    ElmApp.ports.recvREGLCmd.send({
        _c: "createGLProgram",
        response
    });
}


async function setView(view) {
    gview = view;
    resolver();
}

function updateElm(delta) {
    return new Promise((resolve, _) => {
        resolver = resolve;
        ElmApp.ports.reglupdate.send(delta);
    });
}

function allocNewFBO() {
    const fb = regl.framebuffer({
        color: regl.texture({
            width: 1,
            height: 1
        }),
        depth: false
    });
    fbos.push(fb);

    palettes.push(regl({
        framebuffer: fb,
        uniforms: {
            view: [userConfig.virtWidth / 2, -userConfig.virtHeight / 2],
            camera: () => {
                return camera;
            }
        },
        depth: { enable: false },
        blend: {
            enable: true,
            func: {
                src: 'one',
                dst: 'one minus src alpha'
            }
        },
    }));
}

function getFreePalette() {
    for (let i = 0; i < userConfig.fboNum; i++) {
        if (freePalette[i]) {
            freePalette[i] = false;
            // console.log("Free palette found: " + i);
            return i;
        }
    }
    console.warn("No free palette found!");
    if (userConfig.fboNum > 1000) {
        throw new Error("Error: Exceeding maximum fbo number!");
    }
    // Acquire a new FBO
    allocNewFBO();
    const vpWidth = regl._gl.drawingBufferWidth;
    const vpHeight = regl._gl.drawingBufferHeight;
    fbos[userConfig.fboNum].resize(vpWidth, vpHeight);
    freePalette[userConfig.fboNum] = false;
    userConfig.fboNum++;
    return userConfig.fboNum - 1;
}

function drawSingleCommand(v) {
    if (!v || v._c == undefined) {
        return;
    }
    // v is a command
    if (v._c == 0) { // Render commands
        const p = loadedPrograms[v._p];
        execProg(p, v);
    } else if (v._c == 1) {
        // REGL commands
        regl[v._n](v);
    } else {
        console.log(v);
        throw new Error("drawSingleCommand: Unknown command type: " + v._c);
    }
}

function execProg(p, va) {
    if (p) {
        const args = p[0](va);
        if (args) {
            p[1](args);
        }
    }
}

function drawComp(v) {
    // v is a composition command
    // Return the id of the palette used
    if (!v) {
        return -1;
    }
    const r1pid = drawCmd(v.r1);
    const r2pid = drawCmd(v.r2);
    const npid = getFreePalette();
    palettes[npid]({}, () => {
        regl.clear({ color: [0, 0, 0, 0] });
        const p = loadedPrograms[v._p];
        v.t1 = fbos[r1pid];
        v.t2 = fbos[r2pid];
        execProg(p, v);
    });
    freePID(r1pid);
    freePID(r2pid);
    return npid;
}

function simpleCompose(oldp, newp) {
    if (oldp == -1) {
        return newp;
    }
    if (oldp == newp) {
        return oldp;
    }
    palettes[oldp]({}, () => {
        drawPalette({ fbo: fbos[newp] });
    });
    freePID(newp);
    return oldp;

}

function freePID(pid) {
    if (pid >= 0) {
        freePalette[pid] = true;
    }
}

function applyEffect(e, pid) {
    // Return the id of the palette used
    const npid = getFreePalette();
    palettes[npid]({}, () => {
        regl.clear({ color: [0, 0, 0, 0] });
        const p = loadedPrograms[e._p];
        e.texture = fbos[pid];
        execProg(p, e);
    });
    return npid;
}

function drawGroup(v, prev) {
    // v is a group command
    // Return the id of the palette used

    // Callee-save camera
    let prev_camera = camera;

    if (!v) {
        return prev;
    }

    // Special optimization

    const cmds = v.c;
    const effects = v.e;

    if (cmds.length == 0) {
        return prev;
    }

    if (v._sc) {
        // Set camera
        camera = v._sc;
    }

    let curPalette = prev;

    for (let i = 0; i < cmds.length; i++) {
        const c = cmds[i];
        if (!c) {
            continue;
        }
        let pid = -1;
        if (c._c == 2) {
            // Group
            if (c.e.length == 0) {
                pid = drawGroup(c, curPalette);
            } else {
                pid = drawGroup(c, -1);
            }
            if (pid < 0) {
                continue;
            }
        } else if (c._c == 3) {
            // Composite
            pid = drawComp(c);
            if (pid < 0) {
                continue;
            }
        } else if (c._c == 4) {
            // SaveAsTexture
            if (curPalette >= 0) {
                loadedTextures[c._n] = fbos[curPalette];
            }
        } else {
            // Other Single Commands
            pid = curPalette >= 0 ? curPalette : getFreePalette();
            // console.log("draw single command:", pid);
            palettes[pid]({}, () => {
                if (curPalette < 0 && c._c != 1) {
                    // Automatically clear the palette
                    regl.clear({ color: [0, 0, 0, 0] });
                }
                while (i < cmds.length) {
                    const lc = cmds[i];
                    if (!lc) {
                        i++;
                        continue;
                    }
                    if (lc._c == 2 || lc._c == 3) {
                        i--;
                        break;
                    } else {
                        drawSingleCommand(lc);
                    }
                    i++;
                }
            });

        }
        // const tmpold = curPalette;
        curPalette = simpleCompose(curPalette, pid);
        // console.log("simple compose:", tmpold, pid, " -> ", curPalette);
    }

    // Apply effects
    for (let i = 0; i < effects.length; i++) {
        const e = effects[i];
        const npid = applyEffect(e, curPalette);
        // console.log("apply effect:", curPalette, " -> ", npid);
        freePID(curPalette);
        curPalette = npid;
    }

    camera = prev_camera;
    return curPalette;
}

function drawCmd(v) {
    if (!v) {
        return -1;
    }
    if (v._c == 0 || v._c == 1) {
        const pid = getFreePalette();
        palettes[pid]({}, () => {
            if (v._c != 1) {
                // Automatically clear the palette
                regl.clear({ color: [0, 0, 0, 0] });
            }
            drawSingleCommand(v);
        });
        return pid;
    } else if (v._c == 2) {
        return drawGroup(v, -1);
    } else if (v._c == 3) {
        return drawComp(v);
    } else {
        throw new Error("drawCmd: Unknown command: " + v._c);
    }
}

async function step() {
    if (global_error) {
        return;
    }

    try {
        if (userConfig.interval > 0) {
            // Call step in interval
            setTimeout(step, userConfig.interval);
        } else {
            requestAnimationFrame(step);
        }
        regl.poll();
        const vpWidth = regl._gl.drawingBufferWidth;
        const vpHeight = regl._gl.drawingBufferHeight;

        for (let i = 0; i < userConfig.fboNum; i++) {
            fbos[i].resize(vpWidth, vpHeight);
        }

        // const t1 = performance.now();

        const ts = browserSupportNow ? navigationStartTime + window.performance.now() : Date.now();

        await updateElm(ts);
        // const t2 = performance.now();
        // console.log("Time to update Elm: " + (t2 - t1) + "ms");

        for (let i = 0; i < userConfig.fboNum; i++) {
            freePalette[i] = true;
        }

        // console.log(gview);
        const pid = drawCmd(gview);
        if (pid >= 0) {
            drawPalette({ fbo: fbos[pid] });
        }
        // const t3 = performance.now();
        // console.log("Time to render view: " + (t3 - t2) + "ms");
        regl._gl.flush();
    } catch (e) {
        stopError(e);
    }

}

async function start(v) {
    // const t0 = performance.now();
    if ("virtWidth" in v) {
        userConfig.virtWidth = v.virtWidth;
    }
    if ("virtHeight" in v) {
        userConfig.virtHeight = v.virtHeight;
    }
    if ("fboNum" in v) {
        userConfig.fboNum = v.fboNum;
    }
    let toloadprograms = Object.keys(programs);
    if ("programs" in v) {
        toloadprograms = v.programs;
    }

    // Init
    for (prog_name of toloadprograms) {
        loadBuiltinGLProgram(prog_name);
    }

    // Set camera initial value
    camera = [userConfig.virtWidth / 2, userConfig.virtHeight / 2, 1.0, 0.0];


    // Load arial font
    await TextManager.init();

    for (let i = 0; i < userConfig.fboNum; i++) {
        allocNewFBO();
    }

    drawPalette = regl({
        frag: readFileSync('src/palette/frag.glsl', 'utf8'),
        vert: readFileSync('src/palette/vert.glsl', 'utf8'),
        attributes: {
            texc: [
                1, 1,
                1, 0,
                0, 0,
                0, 1]
        },
        uniforms: {
            texture: regl.prop('fbo')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        depth: { enable: false },

        count: 6
    });

    // const t1 = performance.now();
    // console.log("REGL initialized in " + (t1 - t0) + "ms");
    requestAnimationFrame(step);
}

function loadGLProgram(prog_name, f) {
    // Initialize program
    loadedPrograms[prog_name] = f(regl);
}

function loadBuiltinGLProgram(prog_name) {
    // Initialize program
    if (programs[prog_name]) {
        loadedPrograms[prog_name] = programs[prog_name]();
    } else {
        throw new Error("Program not found: " + prog_name);
    }
}

function init(canvas, app, override_conf) {
    ElmApp = app;
    const defconfig = {
        canvas,
        extensions: ['OES_standard_derivatives'],
        attributes: {
            antialias: false,
            depth: false,
            premultipliedAlpha: true
        }
    }
    for (const key in override_conf) {
        defconfig[key] = override_conf[key];
    }
    regl = require('regl')(defconfig);
    TextManager = new TM(regl);
}

function config(c) {
    if ("interval" in c) {
        userConfig.interval = c.interval;
    }
}

async function loadFont(v) {
    await TextManager.loadFont(v._n, v.img, v.json);
    const response = {
        font: v._n
    }
    ElmApp.ports.recvREGLCmd.send({
        _c: "loadFont",
        response
    });
}

function execCmd(v) {
    // NOTE. May happen before start
    // console.log(v);
    try {
        if (v._c == "loadFont") {
            loadFont(v);
        } else if (v._c == "loadTexture") {
            loadTexture(v._n, v.opts);
        } else if (v._c == "createGLProgram") {
            createGLProgram(v._n, v.proto);
        } else if (v._c == "config") {
            config(v.config);
        } else if (v._c == "start") {
            start(v);
        } else {
            throw new Error("No such command: " + v._c);
        }
    } catch (e) {
        stopError(e);
    }
}

globalThis.ElmREGL = {
    loadGLProgram,
    setView,
    init,
    execCmd
}
