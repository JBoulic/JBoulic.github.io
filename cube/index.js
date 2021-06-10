import { Cube } from './cube.js';

function main() {
  // Canvas.
  const canvas = document.querySelector('#glcanvas');

  // Context.
  const gl = canvas.getContext('webgl');
  if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
  }

  // Cube.
  const cube = new Cube(canvas, gl);
  cube.initialize();

  const resize = () => {
    // Resize canvas.
    const quality = 1.0;
    canvas.width = canvas.offsetWidth * quality;
    canvas.height = canvas.offsetHeight * quality;

    // Resize on screen data.
    const letterPair = document.querySelector('#letterPair');
    letterPair.style.left = (window.innerWidth - letterPair.offsetWidth) / 2;
    const letterPairWord = document.getElementById("letterPairWord");
    letterPairWord.style.left = (window.innerWidth - letterPairWord.offsetWidth) / 2;
    const algorithm = document.getElementById("algorithm");
    algorithm.style.left = (window.innerWidth - algorithm.offsetWidth) / 2;
    
    cube.resize();
  }

  // Map canvas to window size.
  resize();
  window.onresize = resize;

  // Context lost handlers.
  const handleContextLost = (e) => {
      e.preventDefault();
      if (requestId !== undefined) {
          window.cancelAnimFrame(requestId);
          requestId = undefined;
      }
  }

  const handleContextRestored = () => {
    cube.initialize();
  }

  canvas.addEventListener('webglcontextlost', handleContextLost, false);
  canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

  // Update letter Pair Word position relative to letter pair.
  document.getElementById("letterPairWord").style.top = document.getElementById("letterPair").style.top + 130;
}

window.addEventListener("load", function() {
  main();
});
