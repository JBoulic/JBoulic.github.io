var gl = null;
var canvas = null;
var fpsCounter = null;

// Start
function start() {
    Renderer.initShaderProgram();
    Renderer.initBuffers();
    Renderer.initScene();
    Model.init();
    Renderer.initBufferData();
    Model.updateCornerSticker("J", 1.0);
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
    Animation.updateState(deltaTime);

    // Render
    Renderer.updateScene();

    // Fps
    fpsCounter.update();

    // Loop
    requestAnimationFrame(render);
}


function main() {
    // Initialize context.
    canvas = document.querySelector('#glcanvas');
    gl = canvas.getContext('webgl');
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Context lost handlers.
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    function handleContextLost(e) {
        e.preventDefault();
        if (requestId !== undefined) {
            window.cancelAnimFrame(requestId);
            requestId = undefined;
        }
    }

    function handleContextRestored() {
        start();
    }

    // Add event listener.
    document.addEventListener("keydown", Controller.handleKeyDown, false);

    // Initialize fps counter.
    var fps = document.getElementById("fps");
    if (fps) {
        fpsCounter = new FPSCounter(fps);
    }

    start();
}
