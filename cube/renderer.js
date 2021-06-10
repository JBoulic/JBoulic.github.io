import { Mat4 } from './matrix.js';
import { DEFAULT_CONTROLLER_MODE } from './constants.js';

// Takes Model data and renders it.
export class Renderer {
    constructor(gl, model) {
        this.gl_ = gl;
        this.model_ = model;
        this.buffers_ = null;  // buffers = { square: positionBuffer, color: colorBuffer, texture: textureBuffer, fillSticker: fillStickerBuffer}
        this.programInfo_ = null;  // programInfo = {program: ..., attribLocations: ..., uniformLocations: ...}
    
        // Positions[piece][square] is a positions list
        // Colors[piece][square] is a colors list
        this.positionBufferData = [];  // Modified directly by the animation instance.
        this.colorBufferData_ = [];
        this.opaqueBufferData = [];
    }



    loadShader_(type, source) {
        const shader = this.gl_.createShader(type);
        this.gl_.shaderSource(shader, source);
        this.gl_.compileShader(shader);
        if (!this.gl_.getShaderParameter(shader, this.gl_.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + this.gl_.getShaderInfoLog(shader));
            this.gl_.deleteShader(shader);
            return null;
        }
        return shader;
    }

    initShaderProgram() {
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

            uniform int uSolveMode;

            varying vec4 vColor;
            varying vec2 vTexCoord;
            varying float fill;

            float borders(vec2 uv, float borderWidth) {
                vec2 borderBottomLeft = smoothstep(vec2(0.0), vec2(borderWidth), uv);
              
                vec2 borderTopRight = smoothstep(vec2(0.0), vec2(borderWidth), 1.0 - uv);
              
                return 1.0 - borderBottomLeft.x * borderBottomLeft.y * borderTopRight.x * borderTopRight.y;
            }

            void main() {
                if (uSolveMode == 1) {
                    gl_FragColor = vColor;
                    return;
                }
                float alpha = borders(vTexCoord, 0.05);
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
    
        const vertexShader = this.loadShader_(this.gl_.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader_(this.gl_.FRAGMENT_SHADER, fsSource);
    
        const shaderProgram = this.gl_.createProgram();
        this.gl_.attachShader(shaderProgram, vertexShader);
        this.gl_.attachShader(shaderProgram, fragmentShader);
        this.gl_.linkProgram(shaderProgram);
    
        // If creating the shader program failed, alert
        if (!this.gl_.getProgramParameter(shaderProgram, this.gl_.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + this.gl_.getProgramInfoLog(shaderProgram));
            return null;
        }
    
        // Collect all the info needed to use the shader program.
        this.programInfo_ = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl_.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: this.gl_.getAttribLocation(shaderProgram, 'aVertexColor'),
                textureCoord: this.gl_.getAttribLocation(shaderProgram, 'aTexCoord'),
                fillSticker: this.gl_.getAttribLocation(shaderProgram, 'fillSticker'),
            },
            uniformLocations: {
                projectionMatrix: this.gl_.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl_.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                solveMode: this.gl_.getUniformLocation(shaderProgram, 'uSolveMode'),
            },
        };
    }

    // Buffers
    initBuffers() {
        var positionBuffer = this.gl_.createBuffer();
        var colorBuffer = this.gl_.createBuffer();
        var textureBuffer = this.gl_.createBuffer();
        var fillStickerBuffer = this.gl_.createBuffer();
        this.buffers_ = {
            square: positionBuffer,
            color: colorBuffer,
            texture: textureBuffer,
            fillSticker: fillStickerBuffer,
        };
    }

    // Draw static elements
    initScene() {
        this.gl_.useProgram(this.programInfo_.program);
        this.gl_.enable(this.gl_.DEPTH_TEST);           // Enable depth testing
        this.gl_.depthFunc(this.gl_.LEQUAL);            // Near things obscure far things

        // Camera
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = this.gl_.canvas.clientWidth / this.gl_.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;

        const projectionMatrix = Mat4.create();
        Mat4.perspective(projectionMatrix,
                            fieldOfView,
                            aspect,
                            zNear,
                            zFar);
        this.gl_.uniformMatrix4fv(this.programInfo_.uniformLocations.projectionMatrix, false, projectionMatrix);

        const modelViewMatrix = Mat4.create();
        Mat4.fromRotation(modelViewMatrix, 25 * Math.PI / 180, [1, 0, 0])
        Mat4.translate(modelViewMatrix,     // matrix to translate
                        [0.0, -3.8, -8.0]);  // amount to translate
        this.gl_.uniformMatrix4fv(this.programInfo_.uniformLocations.modelViewMatrix, false, modelViewMatrix);

        this.gl_.uniform1i(this.programInfo_.uniformLocations.solveMode, DEFAULT_CONTROLLER_MODE);
    }
    
    initBufferData() {
        for (var p = 0; p < this.model_.pieces.length; p++) {
            let nSquares = this.model_.pieces[p].squares.length;
            this.positionBufferData.push([]);
            this.colorBufferData_.push([]);
            this.opaqueBufferData.push([]);

            for (var s = 0; s < nSquares; s++) {
                this.positionBufferData[p].push(new Float32Array(4 * 3));  // 4 vertices * 3 components
                this.colorBufferData_[p].push(new Float32Array(this.model_.pieces[p].colors[s]));
                this.opaqueBufferData[p].push(new Float32Array([0.0, 0.0, 0.0, 0.0]));
            }
        }

        this.populatePositionBufferData();
    }

    clearOpaqueBufferData() {
        this.opaqueBufferData = [];
        for (var p = 0; p < this.model_.pieces.length; p++) {
            let nSquares = this.model_.pieces[p].squares.length;
            this.opaqueBufferData.push([]);
            for (var s = 0; s < nSquares; s++) {
                this.opaqueBufferData[p].push(new Float32Array([0.0, 0.0, 0.0, 0.0]));
            }
        }
    }

    populatePositionBufferData() {
        for (var p = 0; p < this.model_.pieces.length; p++) {
            let nSquares = this.model_.pieces[p].squares.length;
            for (var s = 0; s < nSquares; s++) {  // number of squares per corner/edge/center
                for (var v = 0; v < 4; v++) {  // 4 vertices per square
                    for (var c = 0; c < 3; c++) {  // 3 components per vertex
                        this.positionBufferData[p][s][v * 3 + c] = this.model_.pieces[p].squares[s][v][c];
                    }
                }
            }
        }
    }

    setSolveMode(mode) {
        this.gl_.uniform1i(this.programInfo_.uniformLocations.solveMode, mode);
    }

    // Utility function for udpateScene
    setBuffersAndAttributes_(buffer, data, numComponents, attribLocation) {
        this.gl_.bindBuffer(this.gl_.ARRAY_BUFFER, buffer);
        this.gl_.bufferData(this.gl_.ARRAY_BUFFER, data, this.gl_.DYNAMIC_DRAW);

        const type = this.gl_.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        this.gl_.vertexAttribPointer(
            attribLocation,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        this.gl_.enableVertexAttribArray(
            attribLocation);
    }

    updateScene() {
        // Clear
        this.gl_.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        this.gl_.clearDepth(1.0);                 // Clear
        this.gl_.clear(this.gl_.COLOR_BUFFER_BIT | this.gl_.DEPTH_BUFFER_BIT);

        const TEXTURE_COORDINATES = new Float32Array([
            0, 0,
            0, 1,
            1, 0,
            1, 1,
        ])

        // Draw
        for (var p = 0; p < this.model_.pieces.length; p++) {
            let nSquares = this.model_.pieces[p].squares.length;
            for (var s = 0; s < nSquares; s++) {
                // Positions
                this.setBuffersAndAttributes_(this.buffers_.square, this.positionBufferData[p][s], 3, this.programInfo_.attribLocations.vertexPosition);

                // Color
                this.setBuffersAndAttributes_(this.buffers_.color, this.colorBufferData_[p][s], 4, this.programInfo_.attribLocations.vertexColor);

                // Texture coordinates
                this.setBuffersAndAttributes_(this.buffers_.texture, TEXTURE_COORDINATES, 2, this.programInfo_.attribLocations.textureCoord);

                // Should fill sticker
                this.setBuffersAndAttributes_(this.buffers_.fillSticker, this.opaqueBufferData[p][s], 1, this.programInfo_.attribLocations.fillSticker);

                // Draw square
                const offset = 0;
                const vertexCount = 4;
                this.gl_.drawArrays(this.gl_.TRIANGLE_STRIP, offset, vertexCount);
            }
        }
    }

}
