let regl = null;
const readFileSync = require('fs').readFileSync;

const loadedPrograms = {};

const loadedTextures = {};

const loadedFonts = {};

let ElmApp = null;

let gview = [];

let resolver = null;

let userConfig = {
    interval: 0,
    virtWidth: 1920,
    virtHeight: 1080,
    ratio: 16 / 9,
    tmat: new Float32Array([
        2 / 1280, 0, 0, 0,
        0, 2 / 720, 0, 0,
        0, 0, 1, 0,
        -1, -1, 0, 1
    ]),
    fboNum: 5
};

let fbos = [];

let palettes = [];

let freePalette = [];

let drawPalette = null;

const rect = () => [
    (x) => x
    , regl({
        frag: readFileSync('src/rect/frag.glsl', 'utf8'),
        vert: readFileSync('src/rect/vert.glsl', 'utf8'),
        attributes: {
            position: regl.buffer([
                [-1, -1], [+1, +1], [-1, +1],
                [-1, -1], [+1, -1], [+1, +1]
            ])
        },
        uniforms: {
            off: regl.prop('off'),
            scale: regl.prop('scale'),
            color: regl.prop('color')
        },
        count: 6
    })]

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

const simpTexture = () => [
    (x) => { x["texture"] = loadedTextures[x["texture"]]; return x },
    regl({
        frag: readFileSync('src/texture/frag.glsl', 'utf8'),
        vert: readFileSync('src/texture/vert.glsl', 'utf8'),
        attributes: {
            texc: [
                1, 1,
                1, 0,
                0, 0,
                0, 1,],
            position: [
                0.02, 0.02,
                0.02, -0.02,
                -0.02, -0.02,
                -0.02, 0.02,]
        },

        uniforms: {
            texture: regl.prop('texture'),
            offset: regl.prop('offset')
        },

        elements: [
            0, 1, 2,
            0, 2, 3
        ],

        count: 6
    })]

const simpText = () => [
    (x) => {
        loadedFonts["arial"].text.remake(x)
        x = {}
        x.tMap = loadedFonts["arial"].texture
        x.position = loadedFonts["arial"].text.buffers.position
        x.elem = loadedFonts["arial"].text.buffers.index
        x.uv = loadedFonts["arial"].text.buffers.uv
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
            tMap: regl.prop('tMap')
        },
        elements: regl.prop('elem'),
        depth: { enable: false },
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
            texture: regl.prop('texture'),
            wRcp: 1 / userConfig.virtWidth,
            hRcp: 1 / userConfig.virtHeight
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
            texture: regl.prop('texture'),
            wRcp: 1 / userConfig.virtWidth,
            hRcp: 1 / userConfig.virtHeight
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
            scanline_count: regl.prop('count'),
            wRcp: 1 / userConfig.virtWidth,
            hRcp: 1 / userConfig.virtHeight,
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
                -1, -1,  // Bottom-left
                1, -1,  // Bottom-right
                -1, 1,  // Top-left
                1, 1,  // Top-right
            ]
        },
        uniforms: {
            center: regl.prop('center'),
            radius: regl.prop('radius'),
            color: regl.prop('color'),
            vw : userConfig.virtWidth,
            vh : userConfig.virtHeight
        },
        elements: [
            0, 1, 2,
            0, 2, 3
        ],

        count: 6
    })
]
const programs = {
    rect,
    triangle,
    simpTexture,
    simpText,
    quad,
    defaultCompositor,
    blur,
    gblur,
    circle,
    crt
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
    console.log("Creating program: " + prog_name);
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
    const genP = {
        frag: proto.frag,
        vert: proto.vert,
        count: proto.count
    }
    if (proto.attributes) {
        genP.attributes = attributes;
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
    const npid = getFreePalette();

    palettes[npid]({}, () => {
        const p = loadedPrograms["defaultCompositor"];
        if (p) {
            p[1](p[0]({
                t1: fbos[oldp],
                t2: fbos[newp],
                mode: 0
            }));
        } else {
            alert("Program not found: " + v.prog);
        }
    });
    freePID(oldp);
    freePID(newp);

    return npid;

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
    if ("virtWidth" in v) {
        userConfig.virtWidth = v.virtWidth;
    }
    if ("virtHeight" in v) {
        userConfig.virtHeight = v.virtHeight;
    }
    userConfig.ratio = userConfig.virtWidth / userConfig.virtHeight;
    userConfig.tmat = new Float32Array([
        2 / userConfig.virtWidth, 0, 0, 0,
        0, 2 / userConfig.virtHeight, 0, 0,
        0, 0, 1, 0,
        -1, -1, 0, 1
    ])

    // Init
    for (prog_name of Object.keys(programs)) {
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
                height: 1,
                wrap: 'clamp'
            }),
            depth: false
        }));

        palettes.push(regl({
            framebuffer: fbos[i],
            uniforms: {
                view: userConfig.tmat
            },
            depth: { enable: false },
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

    requestAnimationFrame(step);
}

function loadGLProgram(prog_name, f) {
    // Initialize program
    loadedPrograms[prog_name] = f(regl);
}

function loadBuiltinGLProgram(prog_name) {
    // Initialize program
    loadedPrograms[prog_name] = programs[prog_name]();
}

function init(canvas, app, { glextensions, fbonum }) {
    ElmApp = app;
    let exts = ['OES_standard_derivatives'];
    if (glextensions) {
        exts = exts.concat(glextensions);
    }
    if (fbonum) {
        userConfig.fboNum = fbonum;
    }
    regl = require('regl')({
        canvas,
        extensions: exts,
    });
}

function config(c) {
    if ("interval" in c) {
        userConfig.interval = c.interval;
    }
}

function Text(font) {
    const _this = this;
    let glyphs, buffers;
    let fontHeight, baseline, scale;

    const newline = /\n/;
    const whitespace = /\s/;

    {
        parseFont();
    }

    function parseFont() {
        glyphs = {};
        font.chars.forEach((d) => (glyphs[d.char] = d));
    }

    function createGeometry() {
        fontHeight = font.common.lineHeight;
        baseline = font.common.base;

        // Use baseline so that actual text height is as close to 'size' value as possible
        scale = size / fontHeight;

        // Strip spaces and newlines to get actual character length for buffers
        let chars = text.replace(/[ \n]/g, '');
        let numChars = chars.length;

        // Create output buffers
        buffers = {
            position: new Float32Array(numChars * 4 * 3),
            uv: new Float32Array(numChars * 4 * 2),
            id: new Float32Array(numChars * 4),
            index: new Uint16Array(numChars * 6),
        };

        // Set values for buffers that don't require calculation
        for (let i = 0; i < numChars; i++) {
            buffers.id.set([i, i, i, i], i * 4);
            buffers.index.set([i * 4, i * 4 + 2, i * 4 + 1, i * 4 + 1, i * 4 + 2, i * 4 + 3], i * 6);
        }

        layout();
    }

    function layout() {
        const lines = [];

        let cursor = 0;

        let wordCursor = 0;
        let wordWidth = 0;
        let line = newLine();

        function newLine() {
            const line = {
                width: 0,
                glyphs: [],
            };
            lines.push(line);
            wordCursor = cursor;
            wordWidth = 0;
            return line;
        }

        let maxTimes = 100;
        let count = 0;
        while (cursor < text.length && count < maxTimes) {
            count++;

            const char = text[cursor];

            // Skip whitespace at start of line
            if (!line.width && whitespace.test(char)) {
                cursor++;
                wordCursor = cursor;
                wordWidth = 0;
                continue;
            }

            // If newline char, skip to next line
            if (newline.test(char)) {
                cursor++;
                line = newLine();
                continue;
            }

            const glyph = glyphs[char] || glyphs[' '];

            // Find any applicable kern pairs
            if (line.glyphs.length) {
                const prevGlyph = line.glyphs[line.glyphs.length - 1][0];
                let kern = getKernPairOffset(glyph.id, prevGlyph.id) * scale;
                line.width += kern;
                wordWidth += kern;
            }

            // add char to line
            line.glyphs.push([glyph, line.width]);

            // calculate advance for next glyph
            let advance = 0;

            // If whitespace, update location of current word for line breaks
            if (whitespace.test(char)) {
                wordCursor = cursor;
                wordWidth = 0;

                // Add wordspacing
                advance += wordSpacing * size;
            } else {
                // Add letterspacing
                advance += letterSpacing * size;
            }

            advance += glyph.xadvance * scale;

            line.width += advance;
            wordWidth += advance;

            // If width defined
            if (line.width > width) {
                // If can break words, undo latest glyph if line not empty and create new line
                if (wordBreak && line.glyphs.length > 1) {
                    line.width -= advance;
                    line.glyphs.pop();
                    line = newLine();
                    continue;

                    // If not first word, undo current word and cursor and create new line
                } else if (!wordBreak && wordWidth !== line.width) {
                    let numGlyphs = cursor - wordCursor + 1;
                    line.glyphs.splice(-numGlyphs, numGlyphs);
                    cursor = wordCursor;
                    line.width -= wordWidth;
                    line = newLine();
                    continue;
                }
            }

            cursor++;
            // Reset infinite loop catch
            count = 0;
        }

        // Remove last line if empty
        if (!line.width) lines.pop();

        populateBuffers(lines);
    }

    function populateBuffers(lines) {
        const texW = font.common.scaleW;
        const texH = font.common.scaleH;

        // For all fonts tested, a little offset was needed to be right on the baseline, hence 0.07.
        let y = 0.07 * size;
        let j = 0;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            let line = lines[lineIndex];

            for (let i = 0; i < line.glyphs.length; i++) {
                const glyph = line.glyphs[i][0];
                let x = line.glyphs[i][1];

                if (align === 'center') {
                    x -= line.width * 0.5;
                } else if (align === 'right') {
                    x -= line.width;
                }

                // If space, don't add to geometry
                if (whitespace.test(glyph.char)) continue;

                // Apply char sprite offsets
                x += glyph.xoffset * scale;
                y -= glyph.yoffset * scale;

                // each letter is a quad. axis bottom left
                let w = glyph.width * scale;
                let h = glyph.height * scale;
                buffers.position.set([x, y - h, 0, x, y, 0, x + w, y - h, 0, x + w, y, 0], j * 4 * 3);

                let u = glyph.x / texW;
                let uw = glyph.width / texW;
                let v = glyph.y / texH;
                let vh = glyph.height / texH;
                buffers.uv.set([u, v + vh, u, v, u + uw, v + vh, u + uw, v], j * 4 * 2);

                // Reset cursor to baseline
                y += glyph.yoffset * scale;

                j++;
            }

            y -= size * lineHeight;
        }

        _this.buffers = buffers;
        _this.numLines = lines.length;
        _this.height = _this.numLines * size * lineHeight;
        _this.width = Math.max(...lines.map((line) => line.width));
    }

    function getKernPairOffset(id1, id2) {
        for (let i = 0; i < font.kernings.length; i++) {
            let k = font.kernings[i];
            if (k.first < id1) continue;
            if (k.second < id2) continue;
            if (k.first > id1) return 0;
            if (k.first === id1 && k.second > id2) return 0;
            return k.amount;
        }
        return 0;
    }

    // Update buffers to layout with new layout
    this.resize = function (options) {
        ({ width } = options);
        layout();
    };

    // Completely change text (like creating new Text)
    this.update = function (options) {
        ({ text } = options);
        createGeometry();
    };

    this.remake = function (options) {
        ({
            text,
            width = Infinity,
            align = 'left',
            size = 24,
            letterSpacing = 0,
            lineHeight = 1,
            wordSpacing = 0,
            wordBreak = false
        } = options);
        createGeometry();
    };
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
