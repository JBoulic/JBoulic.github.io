var gl = null;
var canvas = null;
var fpsCounter = null;

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

    var fps = document.getElementById("fps");
    if (fps) {
        fpsCounter = new FPSCounter(fps);
    }

    start();
}
