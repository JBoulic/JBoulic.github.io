// Takes the data computed in model.js and renders it.

// Positions[piece][square] is a positions list
// Colors[piece][square] is a colors list
const positionBufferData = [];
const colorBufferData = [];
const opaqueBufferData = [];

function initBufferData() {
    for (p = 0; p < pieces.length; p++) {
        nSquares = pieces[p].squares.length;
        positionBufferData.push([]);
        colorBufferData.push([]);
        opaqueBufferData.push([]);

        for (s = 0; s < nSquares; s++) {
            positionBufferData[p].push(new Float32Array(4 * 3));  // 4 vertices * 3 components
            colorBufferData[p].push(new Float32Array(pieces[p].colors[s]));
            opaqueBufferData[p].push(new Float32Array([pieces[p].opaque[s], pieces[p].opaque[s], pieces[p].opaque[s], pieces[p].opaque[s]]));
        }
    }

    for (p = 0; p < pieces.length; p++) {
        nSquares = pieces[p].squares.length;
        for (s = 0; s < nSquares; s++) {  // number of squares per corner/edge/center
            for (v = 0; v < 4; v++) {  // 4 vertices per square
                for (c = 0; c < 3; c++) {  // 3 components per vertex
                    positionBufferData[p][s][v * 3 + c] = pieces[p].squares[s][v][c];
                }
            }
        }
    }
}

function updateScene() {
    // Clear
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw
    for (p = 0; p < pieces.length; p++) {
        nSquares = pieces[p].squares.length;
        for (s = 0; s < nSquares; s++) {
            // Positions
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.square);
            gl.bufferData(gl.ARRAY_BUFFER, positionBufferData[p][s], gl.DYNAMIC_DRAW);
            setBuffersAndAttributes(3, programInfo.attribLocations.vertexPosition, buffers.square);

            // Color
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
            gl.bufferData(gl.ARRAY_BUFFER, colorBufferData[p][s], gl.DYNAMIC_DRAW);
            setBuffersAndAttributes(4, programInfo.attribLocations.vertexColor, buffers.color);

            // Texture coordinates
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texture);
            gl.bufferData(gl.ARRAY_BUFFER, TEXTURE_COORDINATES, gl.DYNAMIC_DRAW);
            setBuffersAndAttributes(2, programInfo.attribLocations.textureCoord, buffers.texture);

            // Should fill sticker
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillSticker);
            gl.bufferData(gl.ARRAY_BUFFER, opaqueBufferData[p][s], gl.DYNAMIC_DRAW);
            setBuffersAndAttributes(1, programInfo.attribLocations.fillSticker, buffers.fillSticker);

            // Draw square
            draw(4);
        }
    }
}
