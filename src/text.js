
const newline = /\n/;
const whitespace = /\s/;

function FontManager() {
    const _this = this;
    let loadedFonts = {};
    let fontCache = {};

    function loadFont(name, texture, fontObj) {
        loadedFonts[name] = {
            texture: texture,
            text: new Text(fontObj)
        }
    }

    // Creat a buffer for chars
    // Position not set
    function createGeometry(chars) {
        let numChars = chars.length;
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

            advance += glyph.xadvance * size / charFontText.fontWidth;

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
        }
        // Remove last line if empty
        if (!line.width) lines.pop();

        return lines;
    }


    function populateBuffers(lines, opts) {
        // Get actual buffers from layout

        // For all fonts tested, a little offset was needed to be right on the baseline, hence 0.07.
        let y = -0.07 * opts.size;
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
                y += glyph.yoffset * scale;

                // each letter is a quad. axis bottom left
                let w = glyph.width * scale;
                let h = glyph.height * scale;
                if (it > 0) {
                    // Italics
                    buffers.position.set([x, y + h, x + it * scale, y, x + w, y + h, x + w + it * scale, y], j * 4 * 2);
                } else {
                    buffers.position.set([x, y + h, x, y, x + w, y + h, x + w, y], j * 4 * 2);
                }

                let u = glyph.u;
                let uw = glyph.uw;
                let v = glyph.v;
                let vh = glyph.vh;
                buffers.uv.set([u, v - vh, u, v, u + uw, v - vh, u + uw, v], j * 4 * 2);

                // Reset cursor to baseline
                y -= glyph.yoffset * scale;

                j++;
            }

            y += size * lineHeight;
        }

        _this.buffers = buffers;
        _this.numLines = lines.length;
        _this.height = _this.numLines * size * lineHeight;
        _this.width = Math.max(...lines.map((line) => line.width));
    }

}

function Text(font) {
    const _this = this;
    // let glyphs, buffers;
    // let fontHeight, baseline, scale, unitRange;

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
            _this.glyphs[d.char] = d;
        });
        _this.fontHeight = font.common.lineHeight;
        _this.baseline = font.common.base;
        // Use baseline so that actual text height is as close to 'size' value as possible
        _this.unitRange = [range / w, range / h];
    }

    // function createGeometry() {
    //     // Strip spaces and newlines to get actual character length for buffers
    //     let chars = text.replace(/[ \n]/g, '');
    //     let numChars = chars.length;

    //     // Create output buffers
    //     buffers = {
    //         position: new Float32Array(numChars * 4 * 3),
    //         uv: new Float32Array(numChars * 4 * 2),
    //         id: new Float32Array(numChars * 4),
    //         index: new Uint16Array(numChars * 6),
    //     };

    //     // Set values for buffers that don't require calculation
    //     for (let i = 0; i < numChars; i++) {
    //         buffers.id.set([i, i, i, i], i * 4);
    //         buffers.index.set([i * 4, i * 4 + 2, i * 4 + 1, i * 4 + 1, i * 4 + 2, i * 4 + 3], i * 6);
    //     }

    //     layout();
    // }

    function layout() {
        scale = size / fontHeight;
        // Calculate the layout before printing text
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
            // if (!line.width && whitespace.test(char)) {
            //     cursor++;
            //     wordCursor = cursor;
            //     wordWidth = 0;
            //     continue;
            // }

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

    // function populateBuffers(lines) {
    //     // Get actual buffers from layout

    //     // For all fonts tested, a little offset was needed to be right on the baseline, hence 0.07.
    //     let y = -0.07 * size;
    //     let j = 0;

    //     for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    //         let line = lines[lineIndex];

    //         for (let i = 0; i < line.glyphs.length; i++) {
    //             const glyph = line.glyphs[i][0];
    //             let x = line.glyphs[i][1];

    //             if (align === 'center') {
    //                 x -= line.width * 0.5;
    //             } else if (align === 'right') {
    //                 x -= line.width;
    //             }

    //             // If space, don't add to geometry
    //             if (whitespace.test(glyph.char)) continue;

    //             // Apply char sprite offsets
    //             x += glyph.xoffset * scale;
    //             y += glyph.yoffset * scale;

    //             // each letter is a quad. axis bottom left
    //             let w = glyph.width * scale;
    //             let h = glyph.height * scale;
    //             if (it > 0) {
    //                 // Italics
    //                 buffers.position.set([x, y + h, x + it * scale, y, x + w, y + h, x + w + it * scale, y], j * 4 * 2);
    //             } else {
    //                 buffers.position.set([x, y + h, x, y, x + w, y + h, x + w, y], j * 4 * 2);
    //             }

    //             let u = glyph.u;
    //             let uw = glyph.uw;
    //             let v = glyph.v;
    //             let vh = glyph.vh;
    //             buffers.uv.set([u, v - vh, u, v, u + uw, v - vh, u + uw, v], j * 4 * 2);

    //             // Reset cursor to baseline
    //             y -= glyph.yoffset * scale;

    //             j++;
    //         }

    //         y += size * lineHeight;
    //     }

    //     _this.buffers = buffers;
    //     _this.numLines = lines.length;
    //     _this.height = _this.numLines * size * lineHeight;
    //     _this.width = Math.max(...lines.map((line) => line.width));
    // }

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

    // this.remake = function (options) {
    //     ({
    //         text,
    //         width = Infinity,
    //         align = 'left',
    //         size = 24,
    //         letterSpacing = 0,
    //         lineHeight = 1,
    //         wordSpacing = 0,
    //         wordBreak = false,
    //         it = 0,
    //         baselineOpt = 'top'
    //     } = options);
    //     createGeometry();
    // };
}

module.exports = Text;
