import { DEFAULT_MODE } from './constants.js';
import { ScreenDataHandler } from './screen_data.js';

function main() {
  const screenDataHandler = new ScreenDataHandler();
  screenDataHandler.initializeMode(DEFAULT_MODE);
}

window.addEventListener("load", function() {
  main();
});
