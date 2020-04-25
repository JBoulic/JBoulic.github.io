Refresher on WebGL
https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html

## main.js

- Initializes the canvas
- Calls ```start()``` defined in init.js


## init.js

#### Variables
- buffers
- programInfo
- modelViewMatrix
- then (For the render function)

#### Functions
- start():
    - initShaderProgram();
    - initBuffers();
    - InitScene();
    - initPieces();
    - initBufferData();
    - requestAnimationFrame(render);
- initShaderProgram()
- initBuffers()
- initScene()
- render() -> The main loop
    - updateState(deltaTime);
    - updateScene();


## scene.js

#### Variables
- const positionBufferData = [];
- const colorBufferData = [];

#### Functions
- initBufferData()
- updateScene()


## model.js

#### Variables
- const spacing = 0.05;
- let pieces = [];
- CORNER_SQUARE_PATTERN etc...
- FACES, associative array of (multiplier, component, color)

#### Functions
- initPieces()
- CreateCorner() etc...
- applyRotation(mat, vec)


## controller.js

#### Variables
- const animationSpeed = 15;
- variables to keep track of move/camera state

#### Functions
- applyMove()
- endMove()
- resetCube()
