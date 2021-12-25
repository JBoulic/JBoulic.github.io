export class ScreenDataHandler {
  constructor() {
    this.mode_ = null;
    this.letterPairData_ = JSON.parse(json_data);
    this.currentLetterPair_ = "";

    // Add event listeners.
    document.addEventListener("keydown", this.handleKeyDown_);
    document.addEventListener("touchstart", this.handleTouch_);

    this.resize_();
    window.onresize = this.resize_;
  }

  // Automatically reposition on screen data.
  resize_ = () => {
    // Resize on screen data.
    const mode = document.getElementById("mode");
    mode.style.left = (window.innerWidth - mode.offsetWidth) / 2;
    const letterPair = document.getElementById('letterPair');
    letterPair.style.left = (window.innerWidth - letterPair.offsetWidth) / 2;
    const algorithm = document.getElementById("algorithm");
    algorithm.style.left = (window.innerWidth - algorithm.offsetWidth) / 2;
  }

  initializeMode = (mode) => {
    this.mode_ = mode;
    switch(mode) {
      case 1:
        document.getElementById("mode").innerHTML = "4x4 BLD centers";
        break;
      default:
        console.log("Invalid mode");
    }
    this.resize_();
  }

  handleKeyDown_ = (event) => {
    switch (event.key) {
      case "1":
        initializeMode(1);
        break;
      default:
        if (this.mode_ == 1) {
          this.handleInput_(event.key);
        }
        break;
    }
  }

  handleTouch_ = (event) => {
    let X = event.touches[0].pageX / window.innerWidth;
    let Y = event.touches[0].pageY / window.innerHeight;

    if (Y < 0.5) {
      if (X < 0.5) {
        // Switch mode (top left).
        return;
      }
      // Select letter pair (top right).
      const letterPair = window.prompt("Select letter pair (2 letters)").replace(/\s+/g, '').toUpperCase();
      if (letterPair.length === 2 && /[A-Z]/.test(letterPair[0]) && /[A-Z]/.test(letterPair[1])) {
        this.handleInput_(letterPair[0]);
        this.handleInput_(letterPair[1]);
      }
      return;
    }
    // Change algorithm (bottom).
    this.displayRandomAlgorithm_();
  }
  
  handleInput_ = (key) => {
    switch (key) {
      case " ":
        this.displayRandomAlgorithm_();
        break;
      case "Escape":
        this.clearOnScreenData_();
        break;
      default:
        // Letters.
        if (key.length != 1 || !/[a-zA-Z]/.test(key)) {
          break;
        }
        let letter = key.toUpperCase();

        // Clear algorithm.
        this.updateAlgorithm_("");
        

        // Update letterPair.
        if (this.currentLetterPair_.length < 2) {
          this.currentLetterPair_ += letter;
        } else {
          this.currentLetterPair_ = letter;
        }
        // Save user input for UI display.
        let uiLetterPair = this.currentLetterPair_;
        // Replace Z with X when relevant.
        letter = letter.replace('Z', 'X');
        if (this.currentLetterPair_.length == 2) {
          this.currentLetterPair_ = this.currentLetterPair_.replace('Z', 'X');
        }
        // Update UI letter pair.
        this.updateLetterPair_(uiLetterPair);
        if (this.currentLetterPair_.length == 2 && this.currentLetterPair_ in this.letterPairData_ == false) {
          this.updateAlgorithm_("No algorithm");
          break;
        }
        // Continue only if we have a pair of letters.
        if (this.currentLetterPair_.length != 2) break;
        // Update UI algorithm.
        let currentLetterPairData = this.letterPairData_[this.currentLetterPair_];
        if (this.mode_ == 1) {
          if (!("4x4_bld_center_algs" in currentLetterPairData)) {
            this.updateAlgorithm_("No algorithm");
            break;
          }
          const algorithm = currentLetterPairData["4x4_bld_center_algs"];
          this.updateAlgorithm_(algorithm);
        }
        break;
    }
  }

  clearOnScreenData_ = () => {
    this.updateLetterPair_("");
    this.updateAlgorithm_("");
  }

  updateLetterPair_ = (text) => {
    const letterPair = document.querySelector('#letterPair');
    letterPair.innerHTML = text;
    letterPair.style.left = (window.innerWidth - letterPair.offsetWidth) / 2;
  }

  updateAlgorithm_ = (text) => {
    const algorithm = document.getElementById("algorithm");
    algorithm.innerHTML = text;
    algorithm.style.left = (window.innerWidth - algorithm.offsetWidth) / 2;
  }

  displayRandomAlgorithm_ = (attempt = 0) => {
    if (attempt > 10) {
      console.error("failed to select an algorithm: maximum number of attemps exceeded");
      return;
    }

    const keys = Object.keys(this.letterPairData_);
    let letterPair = keys[Math.floor(Math.random() * keys.length)];
    let data = this.letterPairData_[letterPair];
    if (this.mode_ == 1 && !data.hasOwnProperty("4x4_bld_center_algs") || this.mode_ > 1) {
      return this.displayRandomAlgorithm_(attempt + 1);
    }

    this.currentLetterPair_ = "";
    this.handleInput_(letterPair.charAt(0));
    this.handleInput_(letterPair.charAt(1));
  }
}
