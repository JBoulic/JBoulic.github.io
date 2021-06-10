import { Model } from './model.js';
import { Animation } from './animation.js';
import { Renderer } from './renderer.js';
import { Controller } from './controller.js';

export class Cube {
  constructor(canvas, gl) {
    this.canvas_ = canvas;
    this.gl_ = gl;

    this.model_ = new Model();
    this.renderer_ = new Renderer(this.gl_, this.model_);
    this.animation_ = new Animation(this.model_, this.renderer_);
    this.controller_ = new Controller(this.model_, this.animation_, this.renderer_);
  }

  initialize() {
    this.renderer_.initShaderProgram();
    this.renderer_.initBuffers();
    this.renderer_.initScene();
    this.model_.init();
    this.renderer_.initBufferData();
    this.controller_.initialize();
    this.render();
  }

  resize() {
    this.gl_.viewport(0, 0, this.gl_.canvas.width, this.gl_.canvas.height);
    this.renderer_.initScene();
  }

  render() {
    // Time control
    let then = 0;
    let nSamples = 100;
    let firstFrameTime = 0;
    let frame = 0;

    const renderFrame = (now) => {
      // Time
      now *= 0.001;  // convert to seconds
      const deltaTime = now - then;
      then = now;
  
      // Update state
      this.animation_.updateState(deltaTime);
  
      // Render
      this.renderer_.updateScene();
  
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
      requestAnimationFrame(renderFrame);
    }

    requestAnimationFrame(renderFrame);
  }
}