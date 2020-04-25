    var buffers = null;
    var programInfo = null;

    // Start
    function start() {
        initShaderProgram();
        initBuffers();
        initScene();
        initPieces();
        initBufferData();
        updateCornerSticker("J", 1.0);
        requestAnimationFrame(render);
    }

    // Time control
    var then = 0;

    // Loop
    function render(now) {
        // Time
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        // Update state
        updateState(deltaTime);

        // Render
        updateScene();

        // Fps
        fpsCounter.update();

        // Loop
        requestAnimationFrame(render);
    }
    
    function initShaderProgram() {
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
    
        const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
    
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
        programInfo = {
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
    function initBuffers() {
        var positionBuffer = gl.createBuffer();
        var colorBuffer = gl.createBuffer();
        var textureBuffer = gl.createBuffer();
        var fillStickerBuffer = gl.createBuffer();
        buffers = {
            square: positionBuffer,
            color: colorBuffer,
            texture: textureBuffer,
            fillSticker: fillStickerBuffer,
        };
    }

    // Draw static elements
    function initScene() {
        gl.useProgram(programInfo.program);
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
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);

        const modelViewMatrix = mat4.create();
        mat4.fromRotation(modelViewMatrix, 25 * Math.PI / 180, [1, 0, 0])
        mat4.translate(modelViewMatrix,     // destination matrix
                        modelViewMatrix,     // matrix to translate
                        [0.0, -3.8, -8.0]);  // amount to translate
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    }
