
const newline = /\n/;
const whitespace = /\s/;

function FontManager(regl) {
    const _this = this;
    let loadedFonts = {};
    let loadedTexture = {};
    let fontCache = {};

    async function init() {
        const fontjsonObject = require("./consolas/Consolas");
        const fontimg = require("./consolas/ConsolasImage")
        const img = new Image();
        img.src = fontimg;
        await img.decode();
        const texture = regl.texture({
            data: img,
            mag: "linear",
            min: "linear",
            flipY: true
        })
        loadedFonts["consolas"] = {
            texture: "consolas",
            text: new Text(fontjsonObject)
        }
        loadedTexture["consolas"] = texture;
    }

    async function loadFont(name, font_texture, font_json) {
        const fontjson = await (await fetch(font_json)).json();
        loadedFonts[name] = {
            texture: font_texture,
            text: new Text(fontjson)
        }
        if (!loadedTexture.hasOwnProperty(font_texture)) {
            const image = new Image();
            image.src = v.img;
            await image.decode();
            const texture = regl.texture({
                data: image,
                mag: "linear",
                min: "linear",
                flipY: true
            })
            loadedTexture[font_texture] = texture;
        }
    }

    function getTexFromFont(name) {
        return loadedTexture[loadedFonts[name].texture];
    }

    function getFont(name) {
        return loadedFonts[name];
    }

    // Creat a buffer for chars
    // Position not set
    function createGeometry(numChars) {
        const buffers = {
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

        return buffers;
    }

    // Get layout of the text
    function layout(opts) {
        const text = opts.text;
        let totCharNum = 0;
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

        let prevcharFont = "";
        while (cursor < text.length) {
            const char = text[cursor];

            if (newline.test(char)) {
                cursor++;
                line = newLine();
                continue;
            }
            // calculate advance for next glyph
            let advance = 0;

            // If whitespace, update location of current word for line breaks
            if (whitespace.test(char)) {
                wordCursor = cursor;
                wordWidth = 0;

                // Add wordspacing
                if (char === '\t') {
                    advance += opts.wordSpacing * opts.tabsize * opts.size;
                } else {
                    advance += opts.wordSpacing * opts.size;
                }
            } else {
                // Find the glyph from font
                let charFont = "";
                let charFontText;
                let glyph;
                for (let i = 0; i < opts.fonts.length; ++i) {
                    charFontText = loadedFonts[opts.fonts[i]].text;
                    const gs = charFontText.glyphs;
                    if (gs.hasOwnProperty(char)) {
                        // Found
                        charFont = opts.fonts[i];
                        glyph = gs[char];
                        break;
                    }
                }
                if (charFont === "") {
                    // Not found
                    throw new Error("Character not found");
                }

                if (charFont === prevcharFont) {
                    if (line.glyphs.length) {
                        const prevGlyph = line.glyphs[line.glyphs.length - 1][0];
                        let kern = charFontText.getKernPairOffset(glyph.id, prevGlyph.id, opts.size);
                        line.width += kern;
                        wordWidth += kern;
                    }
                }
                console.log("push", glyph);
                line.glyphs.push([glyph, line.width]);
                totCharNum++;
                // Add letterspacing
                advance += opts.letterSpacing * opts.size;

                advance += glyph.xadvance * opts.size / charFontText.fontHeight;
            }
            line.width += advance;
            wordWidth += advance;

            // If width defined
            if (line.width > opts.width) {

                if (whitespace.test(char)) {
                    // If whitespace, ignore this and create new line

                    line.width -= advance;
                    line = newLine();
                    continue;
                }
                // If can break words, undo latest glyph if line not empty and create new line
                if (opts.wordBreak && line.glyphs.length > 1) {
                    line.width -= advance;
                    line.glyphs.pop();
                    line = newLine();
                    continue;

                    // If not first word, undo current word and cursor and create new line
                } else if (!opts.wordBreak && wordWidth !== line.width) {
                    let numGlyphs = cursor - wordCursor + 1;
                    line.glyphs.splice(-numGlyphs, numGlyphs);
                    cursor = wordCursor;
                    line.width -= wordWidth;
                    line = newLine();
                    continue;
                }
            }

            cursor++;
        }
        // Remove last line if empty
        if (!line.width) lines.pop();
        return [lines, totCharNum];
    }


    function populateBuffers(lines, opts) {
        // Get actual buffers from layout

        const buffers = createGeometry(lines[1]);
        lines = lines[0];

        let y = 0;
        let j = 0;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            let line = lines[lineIndex];

            for (let i = 0; i < line.glyphs.length; i++) {
                const glyph = line.glyphs[i][0];
                let x = line.glyphs[i][1];

                if (opts.align === 'center') {
                    x -= line.width * 0.5;
                } else if (opts.align === 'right') {
                    x -= line.width;
                }
                if (opts.baseline == "center") {
                    y -= 0.5 * opts.size;
                } else if (opts.baseline == "bottom") {
                    y -= opts.size;
                }

                // If space, don't add to geometry
                // if (whitespace.test(glyph.char)) continue;
                let scale = opts.size / glyph.fh;
                // Apply char sprite offsets
                x += glyph.xoffset * scale;
                let oldy = y;
                y += glyph.yoffset * scale;
                console.log(glyph);
                // each letter is a quad. axis bottom left
                let w = glyph.width * scale;
                let h = glyph.height * scale;
                if (opts.it > 0) {
                    // Italics
                    buffers.position.set([x, y + h, x + opts.it * scale, y, x + w, y + h, x + w + opts.it * scale, y], j * 4 * 2);
                } else {
                    buffers.position.set([x, y + h, x, y, x + w, y + h, x + w, y], j * 4 * 2);
                }

                let u = glyph.u;
                let uw = glyph.uw;
                let v = glyph.v;
                let vh = glyph.vh;
                buffers.uv.set([u, v - vh, u, v, u + uw, v - vh, u + uw, v], j * 4 * 2);

                // Reset cursor to baseline
                y = oldy;

                j++;
            }

            y += opts.size * opts.lineHeight;
        }

        // return [buffers, lines.length, _this.numLines * opts.size * opts.lineHeight, Math.max(...lines.map((line) => line.width))];
        return buffers;
    }

    function makeText(opts) {
        if (opts.width == null) opts.width = Infinity;
        if (opts.align == null) opts.align = "left";
        if (opts.size == null) opts.size = 24;
        if (opts.letterSpacing == null) opts.letterSpacing = 0;
        if (opts.lineHeight == null) opts.lineHeight = 1;
        if (opts.wordSpacing == null) opts.wordSpacing = 0;
        if (opts.wordBreak == null) opts.wordBreak = false;
        if (opts.it == null) opts.it = 0;
        const lines = layout(opts);
        const res = populateBuffers(lines, opts);
        return res;
    }

    this.init = init;
    this.loadFont = loadFont;
    this.getTexFromFont = getTexFromFont;
    this.getFont = getFont;
    this.makeText = makeText;
}

function Text(font) {
    const _this = this;

    {
        parseFont();
    }

    function parseFont() {
        _this.glyphs = {};
        const range = font.distanceField.distanceRange;
        const w = font.common.scaleW;
        const h = font.common.scaleH;

        font.chars.forEach((d) => {
            let u = d.x / w;
            let uw = d.width / w;
            let v = 1.0 - d.y / h;
            let vh = d.height / h;
            d.u = u;
            d.uw = uw;
            d.v = v;
            d.vh = vh;
            d.fh = font.common.lineHeight;
            _this.glyphs[d.char] = d;
        });
        _this.fontHeight = font.common.lineHeight;
        _this.baseline = font.common.base;
        // Use baseline so that actual text height is as close to 'size' value as possible
        _this.unitRange = [range / w, range / h];
    }

    function getKernPairOffset(id1, id2, size) {
        for (let i = 0; i < font.kernings.length; i++) {
            let k = font.kernings[i];
            if (k.first < id1) continue;
            if (k.second < id2) continue;
            if (k.first > id1) return 0;
            if (k.first === id1 && k.second > id2) return 0;
            return k.amount * size / _this.fontHeight;
        }
        return 0;
    }
    this.getKernPairOffset = getKernPairOffset;
}

module.exports = FontManager;
