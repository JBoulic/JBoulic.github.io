// Takes Model data and renders it.
class Renderer {
    static buffers = null;  // buffers = { square: positionBuffer, color: colorBuffer, texture: textureBuffer, fillSticker: fillStickerBuffer}
    static programInfo = null;  // programInfo = {program: ..., attribLocations: ..., uniformLocations: ...}

    // Positions[piece][square] is a positions list
    // Colors[piece][square] is a colors list
    static positionBufferData = [];
    static colorBufferData = [];
    static opaqueBufferData = [];

    static loadShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    static initShaderProgram() {
        // Vertex shader and fragment shader program.
        const vsSource = `
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
        
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;
            attribute vec2 aTexCoord;
            attribute float fillSticker;

            varying vec4 vColor;
            varying vec2 vTexCoord;
            varying float fill;
        
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
                vTexCoord = aTexCoord;
                fill = fillSticker;
            }
        `;
    
        const fsSource = `
            precision mediump float;

            varying vec4 vColor;
            varying vec2 vTexCoord;
            varying float fill;

            float borders(vec2 uv, float borderWidth) {
                vec2 borderBottomLeft = smoothstep(vec2(0.0), vec2(borderWidth), uv);
              
                vec2 borderTopRight = smoothstep(vec2(0.0), vec2(borderWidth), 1.0 - uv);
              
                return 1.0 - borderBottomLeft.x * borderBottomLeft.y * borderTopRight.x * borderTopRight.y;
            }

            void main() {
                float alpha = borders(vTexCoord, 0.1);
                float r = vColor.x > 0.0 ? vColor.x * (1.0 - alpha) : 0.0;
                float g = vColor.y > 0.0 ? vColor.y * (1.0 - alpha) : 0.0;
                float b = vColor.z > 0.0 ? vColor.z * (1.0 - alpha) : 0.0;
                if (alpha > 0.0) {
                    gl_FragColor = vec4(r, g, b, 1.0);
                } else {
                    if (fill > 0.5) {
                        gl_FragColor = vColor;
                    } else {
                        discard;
                    }

                }
            }
        `;
    
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
    
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
    
        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
    
        // Collect all the info needed to use the shader program.
        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
                textureCoord: gl.getAttribLocation(shaderProgram, 'aTexCoord'),
                fillSticker: gl.getAttribLocation(shaderProgram, 'fillSticker'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
        };
    }

    // Buffers
    static initBuffers() {
        var positionBuffer = gl.createBuffer();
        var colorBuffer = gl.createBuffer();
        var textureBuffer = gl.createBuffer();
        var fillStickerBuffer = gl.createBuffer();
        this.buffers = {
            square: positionBuffer,
            color: colorBuffer,
            texture: textureBuffer,
            fillSticker: fillStickerBuffer,
        };
    }

    // Draw static elements
    static initScene() {
        gl.useProgram(this.programInfo.program);
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

        // Camera
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;

        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix,
                            fieldOfView,
                            aspect,
                            zNear,
                            zFar);
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);

        const modelViewMatrix = mat4.create();
        mat4.fromRotation(modelViewMatrix, 25 * Math.PI / 180, [1, 0, 0])
        mat4.translate(modelViewMatrix,     // destination matrix
                        modelViewMatrix,     // matrix to translate
                        [0.0, -3.8, -8.0]);  // amount to translate
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    }
    
    static initBufferData() {
        for (var p = 0; p < Model.pieces.length; p++) {
            let nSquares = Model.pieces[p].squares.length;
            this.positionBufferData.push([]);
            this.colorBufferData.push([]);
            this.opaqueBufferData.push([]);

            for (var s = 0; s < nSquares; s++) {
                this.positionBufferData[p].push(new Float32Array(4 * 3));  // 4 vertices * 3 components
                this.colorBufferData[p].push(new Float32Array(Model.pieces[p].colors[s]));
                this.opaqueBufferData[p].push(new Float32Array([0.0, 0.0, 0.0, 0.0]));
            }
        }

        this.populatePositionBufferData();
    }

    static populatePositionBufferData() {
        for (var p = 0; p < Model.pieces.length; p++) {
            let nSquares = Model.pieces[p].squares.length;
            for (var s = 0; s < nSquares; s++) {  // number of squares per corner/edge/center
                for (var v = 0; v < 4; v++) {  // 4 vertices per square
                    for (var c = 0; c < 3; c++) {  // 3 components per vertex
                        this.positionBufferData[p][s][v * 3 + c] = Model.pieces[p].squares[s][v][c];
                    }
                }
            }
        }
    }

    // Utility function for udpateScene
    static setBuffersAndAttributes(buffer, data, numComponents, attribLocation) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.vertexAttribPointer(
            attribLocation,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            attribLocation);
    }

    static updateScene() {
        // Clear
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const TEXTURE_COORDINATES = new Float32Array([
            0, 0,
            0, 1,
            1, 0,
            1, 1,
        ])

        // Draw
        for (var p = 0; p < Model.pieces.length; p++) {
            let nSquares = Model.pieces[p].squares.length;
            for (var s = 0; s < nSquares; s++) {
                // Positions
                this.setBuffersAndAttributes(this.buffers.square, this.positionBufferData[p][s], 3, this.programInfo.attribLocations.vertexPosition);

                // Color
                this.setBuffersAndAttributes(this.buffers.color, this.colorBufferData[p][s], 4, this.programInfo.attribLocations.vertexColor);

                // Texture coordinates
                this.setBuffersAndAttributes(this.buffers.texture, TEXTURE_COORDINATES, 2, this.programInfo.attribLocations.textureCoord);

                // Should fill sticker
                this.setBuffersAndAttributes(this.buffers.fillSticker, this.opaqueBufferData[p][s], 1, this.programInfo.attribLocations.fillSticker);

                // Draw square
                const offset = 0;
                const vertexCount = 4;
                gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
            }
        }
    }

}
