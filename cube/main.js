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
    Controller.updateMode();
    requestAnimationFrame(render);
}

// Time control
var then = 0;
var nSamples = 100;
var firstFrameTime = 0;
var frame = 0;
var fps = 0;

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
    if (frame == 0) {
        firstFrameTime = now;
    }
    if (frame < nSamples) {
        frame++;
    } else {
        document.getElementById("fps").innerHTML = "<br>" + Math.round(nSamples / (now - firstFrameTime)) + " fps";
        frame = 0;
    }

    // Loop
    requestAnimationFrame(render);
}

function resize() {
    canvas = document.querySelector('#glcanvas');
    let quality = 0.6;
    canvas.width = canvas.offsetWidth * quality;
    canvas.height = canvas.offsetHeight * quality;
}

function main() {
    // Map canvas to window size.
    resize();
    window.onresize = resize;

    canvas = document.querySelector('#glcanvas');

    // Initialize context.
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
    document.addEventListener("touchstart", Controller.handleTouch, false);

    start();
}
