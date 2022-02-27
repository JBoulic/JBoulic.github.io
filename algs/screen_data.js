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
    window.requestAnimationFrame(() => {
      // Resize on screen data.
      const mode = document.getElementById("mode");
      mode.style.left = (window.innerWidth - mode.offsetWidth) / 2;
      const letterPair = document.getElementById('letterPair');
      letterPair.style.left = (window.innerWidth - letterPair.offsetWidth) / 2;
      const algorithm = document.getElementById("algorithm");
      algorithm.style.left = (window.innerWidth - algorithm.offsetWidth) / 2;
      const letterPairWord = document.getElementById("letterPairWord");
      letterPairWord.style.left = (window.innerWidth - letterPairWord.offsetWidth) / 2;
    });
  }

  initializeMode = (mode) => {
    this.mode_ = mode;
    switch(mode) {
      case 1:
        this.updateMode_("X centers");
        break;
      case 2:
        this.updateMode_("Wings");
        break;
      default:
        console.log("Invalid mode");
    }
    this.resize_();
  }

  handleKeyDown_ = (event) => {
    switch (event.key) {
      case "1":
        this.initializeMode(1);
        break;
      case "2":
        this.initializeMode(2);
        break;
      default:
        if (this.mode_ == 1 || this.mode_ == 2) {
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
        switch (this.mode_) {
          case 1:
            this.initializeMode(2);
            break;
          case 2:
            this.initializeMode(1);
            break;
          default:
            this.initializeMode(1);
        }
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
        this.updateLetterPairWord_("");

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
        // Continue only if we have a pair of letters.
        if (this.currentLetterPair_.length != 2) break;
        // Get data.
        let currentLetterPairData = this.letterPairData_[this.currentLetterPair_];
        if (!(this.currentLetterPair_ in this.letterPairData_)) {
          this.updateLetterPairWord_("No word found");
          this.updateAlgorithm_("No algorithm");
          break;
        }
        // Update word.
        this.updateLetterPairWord_(currentLetterPairData["word"]);
        // Update UI algorithm.
        switch(this.mode_) {
          case 1:
            if (!("x_center_alg" in currentLetterPairData)) {
              this.updateAlgorithm_("No algorithm");
              break;
            }
            const x_center_alg = currentLetterPairData["x_center_alg"];
            this.updateAlgorithm_(x_center_alg);
            break;
          case 2:
            if (!("wing_alg" in currentLetterPairData)) {
              this.updateAlgorithm_("No algorithm");
              break;
            }
            const wing_alg = currentLetterPairData["wing_alg"];
            this.updateAlgorithm_(wing_alg);
            break;
          default:
            console.log("Invalid mode");
            return
        }
        break;
    }
  }

  clearOnScreenData_ = () => {
    this.updateLetterPair_("");
    this.updateLetterPairWord_("");
    this.updateAlgorithm_("");
  }
  
  updateMode_ = (text) => {
    this.clearOnScreenData_();
    const mode = document.querySelector('#mode');
    mode.innerHTML = text;
    window.requestAnimationFrame(() => {
      mode.style.left = (window.innerWidth - letterPair.offsetWidth) / 2;
    });
  }

  updateLetterPair_ = (text) => {
    const letterPair = document.querySelector('#letterPair');
    letterPair.innerHTML = text;
    window.requestAnimationFrame(() => {
      letterPair.style.left = (window.innerWidth - letterPair.offsetWidth) / 2;
    });
  }

  updateLetterPairWord_ = (text) => {
    const word = document.querySelector('#letterPairWord');
    word.innerHTML = text;
    window.requestAnimationFrame(() => {
      word.style.left = (window.innerWidth - word.offsetWidth) / 2;
    });
  }

  updateAlgorithm_ = (text) => {
    const algorithm = document.getElementById("algorithm");
    algorithm.innerHTML = text;
    window.requestAnimationFrame(() => {
      algorithm.style.left = (window.innerWidth - algorithm.offsetWidth) / 2;
    });
  }

  displayRandomAlgorithm_ = (attempt = 0) => {
    if (attempt > 10) {
      console.error("failed to select an algorithm: maximum number of attemps exceeded");
      return;
    }

    const keys = Object.keys(this.letterPairData_);
    let letterPair = keys[Math.floor(Math.random() * keys.length)];
    let data = this.letterPairData_[letterPair];

    switch(mode) {
      case 1:
        if (!data.hasOwnProperty("x_center_alg")) {
          return this.displayRandomAlgorithm_(attempt + 1);
        }
        break;
      case 2:
        if (!data.hasOwnProperty("wing_alg")) {
          return this.displayRandomAlgorithm_(attempt + 1);
        }
        break;
      default:
        console.log("Invalid mode");
        return
    }

    this.currentLetterPair_ = "";
    this.handleInput_(letterPair.charAt(0));
    this.handleInput_(letterPair.charAt(1));
  }
}
