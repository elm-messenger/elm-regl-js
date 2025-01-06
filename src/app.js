let regl = null;
const readFileSync = require('fs').readFileSync;
const Text = require('./text.js');

const loadedPrograms = {};

const loadedTextures = {};

const loadedFonts = {};

let ElmApp = null;

let gview = null;

let resolver = null;

let userConfig = {
    interval: 0,
    virtWidth: 1920,
    virtHeight: 1080,
    fboNum: 5
};

let fbos = [];

let palettes = [];

let freePalette = [];

let drawPalette = null;

const quad = () => [
    (x) => x
    , regl({
        frag: readFileSync('src/triangle/frag.glsl', 'utf8'),
        vert: readFileSync('src/triangle/vert.glsl', 'utf8'),
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

const triangle = () => [
    (x) => x,
    regl({
        frag: readFileSync('src/triangle/frag.glsl', 'utf8'),
        vert: readFileSync('src/triangle/vert.glsl', 'utf8'),
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
        frag: readFileSync('src/triangle/frag.glsl', 'utf8'),
        vert: readFileSync('src/triangle/vert.glsl', 'utf8'),
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
    (x) => { x["texture"] = loadedTextures[x["texture"]]; return x },
    regl({
        frag: readFileSync('src/texture/frag.glsl', 'utf8'),
        vert: readFileSync('src/texture/vert.glsl', 'utf8'),
        attributes: {
            texc: [
                0, 0,
                1, 0,
                1, 1,
                0, 1,],
            position: regl.prop('pos')
        },
        uniforms: {
            texture: regl.prop('texture')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6,
    })]

const centeredTexture = () => [
    (x) => { x["texture"] = loadedTextures[x["texture"]]; return x },
    regl({
        frag: readFileSync('src/texture-centered/frag.glsl', 'utf8'),
        vert: readFileSync('src/texture-centered/vert.glsl', 'utf8'),
        attributes: {
            aVertexPosition: [
                -0.5, -0.5,
                0.5, -0.5,
                0.5, 0.5,
                -0.5, 0.5,],
        },
        uniforms: {
            texture: regl.prop('texture'),
            position: regl.prop('center'),
            size: regl.prop('size'),
            angle: regl.prop('angle'),
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6,
    })]

const textbox = () => [
    (x) => {
        const font = x.font;
        if (!loadedFonts[font]) {
            alert("Font not found: " + font);
        }
        loadedFonts[font].text.remake(x)
        x.tMap = loadedFonts[font].texture
        x.position = loadedFonts[font].text.buffers.position
        x.elem = loadedFonts[font].text.buffers.index
        x.uv = loadedFonts[font].text.buffers.uv
        return x;
    },
    regl({
        frag: readFileSync('src/text/frag.glsl', 'utf8'),
        vert: readFileSync('src/text/vert.glsl', 'utf8'),
        attributes: {
            position: regl.prop('position'),
            uv: regl.prop('uv')
        },
        uniforms: {
            tMap: regl.prop('tMap'),
            offset: regl.prop('offset')
        },
        elements: regl.prop('elem'),
        depth: { enable: false }
    })
]

const defaultCompositor = () => [
    x => x,
    regl({
        frag: readFileSync('src/compositors/frag.glsl', 'utf8'),
        vert: readFileSync('src/compositors/vert.glsl', 'utf8'),
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
        frag: readFileSync('src/compFade/frag.glsl', 'utf8'),
        vert: readFileSync('src/compFade/vert.glsl', 'utf8'),
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
        x["mask"] = loadedTextures[x["mask"]]; return x
    },
    regl({
        frag: readFileSync('src/imgFade/frag.glsl', 'utf8'),
        vert: readFileSync('src/imgFade/vert.glsl', 'utf8'),
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
            t2: regl.prop('t2')
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })
]

const blur = () => [
    x => x,
    regl({
        frag: readFileSync('src/blur/frag.glsl', 'utf8'),
        vert: readFileSync('src/blur/vert.glsl', 'utf8'),
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

const gblur = () => [
    x => x,
    regl({
        frag: readFileSync('src/gblur/frag.glsl', 'utf8'),
        vert: readFileSync('src/gblur/vert.glsl', 'utf8'),
        attributes: {
            texc: [
                1, 1,
                1, 0,
                0, 0,
                0, 1,]
        },
        uniforms: {
            sigma: regl.prop('sigma'),
            texture: regl.prop('texture')
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
        frag: readFileSync('src/crt/frag.glsl', 'utf8'),
        vert: readFileSync('src/crt/vert.glsl', 'utf8'),
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
        frag: readFileSync('src/fxaa/frag.glsl', 'utf8'),
        vert: readFileSync('src/fxaa/vert.glsl', 'utf8'),
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
        frag: readFileSync('src/alphamult/frag.glsl', 'utf8'),
        vert: readFileSync('src/alphamult/vert.glsl', 'utf8'),
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
        frag: readFileSync('src/circle/frag.glsl', 'utf8'),
        vert: readFileSync('src/circle/vert.glsl', 'utf8'),
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
    circle,
    poly,
    texture,
    centeredTexture,
    // Effects
    blur,
    gblur,
    crt,
    fxaa,
    alphamult,
    // Compositors
    defaultCompositor,
    compFade,
    imgFade,
}

function loadTexture(texture_name, opts) {
    // Initialize textures
    const image = new Image();
    image.src = opts.data;
    image.onload = () => {
        opts.data = image;
        loadedTextures[texture_name] = regl.texture(opts);
        // Response to Elm
        const response = {
            texture: texture_name,
            width: image.width,
            height: image.height
        }
        ElmApp.ports.recvREGLCmd.send({
            cmd: "loadTexture",
            response
        });
    }
    image.onerror = () => {
        alert("Error loading texture: " + image.src)
    }
}


function createGLProgram(prog_name, proto) {
    if (loadedPrograms[prog_name]) {
        alert("Program already exists: " + prog_name);
        return;
    }
    // console.log("Creating program: " + prog_name);
    const uniforms = proto.uniforms ? proto.uniforms : {};
    const attributes = proto.attributes ? proto.attributes : {};
    const uniformTextureKeys = proto.uniformsDynTexture ? Object.keys(proto.uniformsDynTexture) : [];
    const initfunc = (x) => {
        for (let i = 0; i < uniformTextureKeys.length; i++) {
            const key = uniformTextureKeys[i];
            if (key in x) {
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
        cmd: "createGLProgram",
        response
    });
}


async function setView(view) {
    gview = view;
    resolver();
}

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

function updateElm(delta) {
    return new Promise((resolve, _) => {
        resolver = resolve;
        ElmApp.ports.reglupdate.send(delta);
    });
}

function getFreePalette() {
    for (let i = 0; i < userConfig.fboNum; i++) {
        if (freePalette[i]) {
            freePalette[i] = false;
            // console.log("Free palette found: " + i);
            return i;
        }
    }
    alert("No free palette found!");
}

function drawSingleCommand(v) {
    // v is a command
    if (!v.args) {
        v.args = {};
    }
    if (v.cmd == 0) { // Render commands
        const p = loadedPrograms[v.prog];
        if (p) {
            p[1](p[0](v.args));
        } else {
            alert("Program not found: " + v.prog);
        }
    } else if (v.cmd == 1) {
        // REGL commands
        regl[v.name](v.args);
    } else {
        alert("Unknown command: " + v.cmd);
    }
}

function drawComp(v) {
    // v is a composition command
    // Return the id of the palette used
    const r1pid = drawCmd(v.r1);
    const r2pid = drawCmd(v.r2);
    const npid = getFreePalette();
    if (!v.args) {
        v.args = {};
    }
    palettes[npid]({}, () => {
        regl.clear({ color: [0, 0, 0, 0] });
        const p = loadedPrograms[v.prog];
        v.args.t1 = fbos[r1pid];
        v.args.t2 = fbos[r2pid];
        if (p) {
            p[1](p[0](v.args));
        } else {
            alert("Program not found: " + v.prog);
        }
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
    if (!e.args) {
        e.args = {};
    }
    palettes[npid]({}, () => {
        regl.clear({ color: [0, 0, 0, 0] });
        const p = loadedPrograms[e.prog];
        e.args.texture = fbos[pid];
        if (p) {
            p[1](p[0](e.args));
        } else {
            alert("Program not found: " + e.prog);
        }
    });
    return npid;
}

function drawGroup(v, prev) {
    // v is a group command
    // Return the id of the palette used

    // Special optimization

    const cmds = v.c;
    const effects = v.e;

    if (cmds.length == 0) {
        return -1;
    }
    if (cmds.length == 1 && cmds[0].cmd == 2) {
        // Single group command, concat effects
        cmds[0].e = cmds[0].e.concat(effects);
        if (effects.length == 0) {
            return drawGroup(cmds[0], prev);
        } else {
            return drawGroup(cmds[0], -1);
        }
    }

    let curPalette = prev;

    for (let i = 0; i < cmds.length; i++) {
        const c = cmds[i];
        let pid = -1;
        if (c.cmd == 2) {
            // Group
            if (c.e.length == 0) {
                pid = drawGroup(c, curPalette);
            } else {
                pid = drawGroup(c, -1);
            }
            if (pid < 0) {
                continue;
            }
        } else if (c.cmd == 3) {
            // Composite
            pid = drawComp(c);
            if (pid < 0) {
                continue;
            }
        } else if (c.cmd == 4) {
            // SaveAsTexture
            if (curPalette >= 0) {
                loadedTextures[c.name] = fbos[curPalette];
            }
        } else {
            // Other Single Commands
            pid = curPalette >= 0 ? curPalette : getFreePalette();
            // console.log("draw single command:", pid);
            palettes[pid]({}, () => {
                if (curPalette < 0 && c.cmd != 1) {
                    // Automatically clear the palette
                    regl.clear({ color: [0, 0, 0, 0] });
                }
                while (i < cmds.length) {
                    const lc = cmds[i];
                    if (lc.cmd == 2 || lc.cmd == 3) {
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

    return curPalette;
}

function drawCmd(v) {
    if (v.cmd == 0 || v.cmd == 1) {
        const pid = getFreePalette();
        palettes[pid]({}, () => {
            if (v.cmd != 1) {
                // Automatically clear the palette
                regl.clear({ color: [0, 0, 0, 0] });
            }
            drawSingleCommand(v);
        });
        return pid;
    } else if (v.cmd == 2) {
        return drawGroup(v, -1); // TODO: optimization: optional drawto
    } else if (v.cmd == 3) {
        return drawComp(v);
    } else {
        alert("Unknown command: " + v.cmd);
    }
}

async function step(t) {
    if (userConfig.interval > 0) {
        // Call step in interval
        setTimeout(() => {
            requestAnimationFrame(step);
        }, userConfig.interval);
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
    await updateElm(t / 1000);
    // const t2 = performance.now();
    // console.log("Time to update Elm: " + (t2 - t1) + "ms");

    for (let i = 0; i < userConfig.fboNum; i++) {
        freePalette[i] = true;
    }

    // console.log(gview)
    if (gview) {
        const pid = drawCmd(gview);
        if (pid >= 0) {
            drawPalette({ fbo: fbos[pid] });
        }
    }

    // const t3 = performance.now();
    // console.log("Time to render view: " + (t3 - t2) + "ms");
    regl._gl.flush();
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

    // Load arial font

    const fontjson = readFileSync("src/arial/Arial.json", "utf-8")
    const fontjsonObject = JSON.parse(fontjson);
    const fontimg = require("./arial/ArialImage")
    const texture = regl.texture({
        data: fontimg,
        mag: "linear",
        min: "linear",
    })
    loadedFonts["arial"] = {
        texture: texture,
        text: new Text(fontjsonObject)
    }

    for (let i = 0; i < userConfig.fboNum; i++) {
        fbos.push(regl.framebuffer({
            color: regl.texture({
                width: 1,
                height: 1
            }),
            depth: false
        }));

        palettes.push(regl({
            framebuffer: fbos[i],
            uniforms: {
                view: [userConfig.virtWidth, userConfig.virtHeight]
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
        alert("Program not found: " + prog_name);
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
}

function config(c) {
    if ("interval" in c) {
        userConfig.interval = c.interval;
    }
}

async function loadFont(v) {
    let nfont = {}
    const fontjson = await (await fetch(v.json)).json();
    const image = new Image();
    image.src = v.img;

    image.onload = () => {
        nfont.texture = regl.texture({
            data: image,
            mag: "linear",
            min: "linear",
        });
        nfont.text = new Text(fontjson)
        loadFont[v.name] = nfont;
        const response = {
            font: v.name
        }
        ElmApp.ports.recvREGLCmd.send({
            cmd: "loadFont",
            response
        });
    }
    image.onerror = () => {
        alert("Error loading font")
    }
}

function execCmd(v) {
    if (v.cmd == "loadFont") {
        loadFont(v);
    } else if (v.cmd == "loadTexture") {
        loadTexture(v.name, v.opts);
    } else if (v.cmd == "createGLProgram") {
        createGLProgram(v.name, v.proto);
    } else if (v.cmd == "config") {
        config(v.config);
    } else if (v.cmd == "start") {
        start(v);
    } else {
        alert("No such command!");
    }
}

globalThis.ElmREGL = {
    loadGLProgram,
    setView,
    init,
    execCmd
}
