import { DEFAULT_CONTROLLER_MODE, SOLVE_MODE_ANIMATION_SPEED, BLD_MODE_ANIMATION_SPEED } from './constants.js';
import { Model } from './model.js';

// This class handles user input 
export class Controller {
    constructor(model, animation, renderer) {
        this.mode_ = null;
        this.model_ = model;
        this.animation_ = animation;
        this.renderer_ = renderer;
        this.solveInputHandler_ = new SolveInputHandler(this.animation_);
        this.BLDPracticeInputHandler_ = new BLDPracticeInputHandler(this.animation_, this.renderer_);

        // Add event listener.
        document.addEventListener("keydown", this.handleKeyDown_, false);
        document.addEventListener("touchstart", this.handleTouch_, false);
    }

    initialize() {
        this.switchMode_(DEFAULT_CONTROLLER_MODE);
    }

    handleKeyDown_ = (event) => {
        switch(event.key) {
            case "1":
                this.switchMode_(1);
                break;
            case "2":
                this.switchMode_(2);
                break;
            case "3":
                this.switchMode_(3);
                break;
            case "Escape":
                this.animation_.resetCube();
                break;
            default:
                if (this.mode_ == 1) {
                    this.solveInputHandler_.handleInput(event.key);
                } else {
                    this.BLDPracticeInputHandler_.handleInput(event.key);
                }
                break;
        }
    }

    switchMode_(mode) {
        this.mode_ = mode;
        this.BLDPracticeInputHandler_.clearOnScreenData();
        this.animation_.resetCube();
        this.renderer_.clearOpaqueBufferData();
        this.renderer_.setSolveMode(mode);
        
        switch(mode) {
            case 1:
                document.getElementById("mode").innerHTML = "Solve mode";
                this.animation_.animationSpeed = SOLVE_MODE_ANIMATION_SPEED;
                break;
            case 2:
                document.getElementById("mode").innerHTML = "BLD corners";
                this.animation_.animationSpeed = BLD_MODE_ANIMATION_SPEED;
                this.BLDPracticeInputHandler_.setMode(mode);
                break;
            case 3:
                document.getElementById("mode").innerHTML = "BLD edges";
                this.animation_.animationSpeed = BLD_MODE_ANIMATION_SPEED;
                this.BLDPracticeInputHandler_.setMode(mode);
                break;
            default:
                console.error("Invalid mode");
                break;
        }
    }

    handleTouch_(event) {
        // Switch to mode 2 or 3 if necessary.
        if (!(this.mode_ === 2 || this.mode_ === 3)) {
            if (this.animation_.busy) {
                return;
            }
            let mode = Math.random() > 0.5 ? 3 : 2;
            this.switchMode_(mode);
        }

        this.BLDPracticeInputHandler_.handleTouch(this, event);
    }
}


// Input handling in solve mode
class SolveInputHandler {
    constructor(animation) {
        this.animation_ = animation;
    }

    handleInput(key) {
        switch(key) {
            case "i":
                this.animation_.addMove("R");
                break;
            case "k":
                this.animation_.addMove("R'");
                break;
            case "e":
                this.animation_.addMove("L'");
                break;
            case "d":
                this.animation_.addMove("L");
                break;
            case "j":
                this.animation_.addMove("U");
                break;
            case "f":
                this.animation_.addMove("U'");
                break;
            case "h":
                this.animation_.addMove("F");
                break;
            case "g":
                this.animation_.addMove("F'");
                break;
            case "l":
                this.animation_.addMove("D'");
                break;
            case "s":
                this.animation_.addMove("D");
                break;
            case "o":
                this.animation_.addMove("B'");
                break;
            case "w":
                this.animation_.addMove("B");
                break;
            case "u":
                this.animation_.addMove("r");
                break;
            case "m":
                this.animation_.addMove("r'");
                break;
            case "r":
                this.animation_.addMove("l'");
                break;
            case "v":
                this.animation_.addMove("l");
                break;
            case "t":
                this.animation_.addMove("x");
                break;
            case "y":
                this.animation_.addMove("x");
                break;
            case "b":
                this.animation_.addMove("x'");
                break;
            case "n":
                this.animation_.addMove("x'");
                break;
            case ";":
                this.animation_.addMove("y");
                break;
            case "a":
                this.animation_.addMove("y'");
                break;
            case "p":
                this.animation_.addMove("z");
                break;
            case "q":
                this.animation_.addMove("z'");
                break;
            case " ":
                this.scramble();
                break;
            default:
                break;
        }
    }

    scramble() {
        const MOVES = [
            ["U", "U'"],
            ["D", "D'"],
            ["R", "R'"],
            ["L", "L'"],
            ["F", "F'"],
            ["B", "B'"],
        ];
        this.animation_.resetCube();
        // God's number is 20. Choosing 35 because, with my scrambling algorithm, some configurations
        // may be more likely than others, and because double turns are not supported.
        const nScrambleMoves = 35;
        // Random index between 0 and 5.
        let nextMoveIndex = Math.floor(Math.random() * 6);
        for (var i = 0; i < nScrambleMoves; i++) {
            this.animation_.addMove(MOVES[nextMoveIndex][Math.floor(Math.random() * 2)]);
            // (nextMove + Random index between 1 and 5) % 6 to ensure that the same face is not selected 2 times.
            nextMoveIndex = (nextMoveIndex + 1 + Math.floor(Math.random() * 4)) % 6;
        }
    }
}


// Input handling in BLD practice mode
class BLDPracticeInputHandler {
    constructor(animation, renderer) {
        this.animation_ = animation;
        this.renderer_ = renderer;
        this.mode_ = 2;
        this.letterPairData_ = JSON.parse(json_data);
        this.currentLetterPair_ = "";
        this.algorithmType_ = "";
        this.shouldInvert_ = false;

        this.currentAlgorithm_ = [];
        this.currentAlgorithmIndex_ = -1;
    }
    
    static ALGORITHM_TYPES = ["Corners", "Corner twist", "No corner alg", "Edges", "Edge flip", "No edge alg"];

    setMode(mode) {
        this.mode_ = mode;
        this.currentLetterPair_ = "";
        if (mode === 2) {
            this.updateCornerSticker_("C", 1.0);
        } else if (mode === 3) {
            this.updateEdgeSticker_("C", 1.0);
        }
    }

    clearOnScreenData() {
        this.updateLetterPair_("");
        this.updateLetterPairWord_("");
        this.updateAlgorithm_("");
    }

    
    updateLetterPair_(text) {
        const letterPair = document.querySelector('#letterPair');
        letterPair.innerHTML = text;
        letterPair.style.left = (window.innerWidth - letterPair.offsetWidth) / 2;
    }
    
    updateLetterPairWord_(text) {
        const letterPairWord = document.getElementById("letterPairWord");
        letterPairWord.innerHTML = text;
        letterPairWord.style.left = (window.innerWidth - letterPairWord.offsetWidth) / 2;
    }
    
    updateAlgorithm_(text) {
        const algorithm = document.getElementById("algorithm");
        algorithm.innerHTML = text;
        algorithm.style.left = (window.innerWidth - algorithm.offsetWidth) / 2;
    }

    updateCornerSticker_(sticker, value) {
        // This is dependent on the order the pieces have been intialized.
        const position = Model.CORNER_NAME_TO_POSITION[sticker];
        this.renderer_.opaqueBufferData[position[0]][position[1]] = new Float32Array([value, value, value, value]);
    }

    updateEdgeSticker_(sticker, value) {
        // This is dependent on the order the pieces have been intialized.
        const position = Model.EDGE_NAME_TO_POSITION[sticker];
        this.renderer_.opaqueBufferData[position[0]][position[1]] = new Float32Array([value, value, value, value]);
    }

    displayCornerWhiteYellowSticker_(sticker) {
        const position = Model.CORNER_NAME_TO_POSITION[sticker];
        this.renderer_.opaqueBufferData[position[0]][0] = new Float32Array([1.0, 1.0, 1.0, 1.0]);
        this.renderer_.opaqueBufferData[position[0]][1] = new Float32Array([0.0, 0.0, 0.0, 0.0]);
        this.renderer_.opaqueBufferData[position[0]][2] = new Float32Array([0.0, 0.0, 0.0, 0.0]);
    }

    handleInput(key) {
        switch(key) {
            case " ":
                this.selectRandomAlgorithm_();
                break;
            case "ArrowRight":
                this.executeNextSequence_();
                break;
            case "ArrowLeft":
                this.reversePreviousSequence_();
                break;
            case "Backspace":
                this.resetAlg_();
                break;
            default:
                if (key.length != 1 || !/[a-zA-Z]/.test(key)) {
                    break;
                }
                if (this.currentAlgorithmIndex_ != -1) {
                    this.animation_.resetCube();
                    this.currentAlgorithmIndex_ = -1;
                }
                // Clear letter pair word and algorithm.
                this.updateLetterPairWord_("");
                this.updateAlgorithm_("");
                let letter = key.toUpperCase();
                // Update letterPair.
                if (this.currentLetterPair_.length < 2) {
                    this.currentLetterPair_ += letter;
                } else {
                    this.currentLetterPair_ = letter;
                    this.renderer_.clearOpaqueBufferData();
                    if (this.mode_ == 2) {
                        this.updateCornerSticker_("C", 1.0);
                    } else if (this.mode_ == 3) {
                        this.updateEdgeSticker_("C", 1.0);
                    }
                }
                // Save user input for UI display.
                let uiLetterPair = this.currentLetterPair_;
                // Replace Z with X when relevant.
                letter = letter.replace('Z', 'X');
                if (this.currentLetterPair_.length == 2) {
                    this.currentLetterPair_ = this.currentLetterPair_.replace('Z', 'X');
                }
                // Reject invalid input if we have a pair of letters.
                if (this.currentLetterPair_.length == 2 && this.currentLetterPair_ in this.letterPairData_ == false) {
                    this.updateLetterPair_(uiLetterPair + ": invalid input");
                    break;
                }
                // Update sticker.
                this.updateLetterPair_(uiLetterPair);
                if (this.mode_ == 2) {
                    this.updateCornerSticker_(letter, 1.0);
                } else if (this.mode_ == 3) {
                    this.updateEdgeSticker_(letter, 1.0);
                }
                // Continue only if we have a valid letter pair word.
                if (this.currentLetterPair_.length != 2) break;
                // Update UI.
                let currentLetterPairData = this.letterPairData_[this.currentLetterPair_];
                if (currentLetterPairData.hasOwnProperty("word") && currentLetterPairData["word"].length > 0) {
                    this.updateLetterPairWord_(currentLetterPairData["word"]);
                }
                if (this.mode_ == 2) {
                    if ("corner_alg" in currentLetterPairData) {
                        this.algorithmType_ = BLDPracticeInputHandler.ALGORITHM_TYPES[0];
                        const algorithm = this.getAlgorithm_(currentLetterPairData["corner_alg"]);
                        this.updateAlgorithm_(algorithm);
                        this.processAlg_(algorithm);
                    } else if ("corner_twist_alg" in currentLetterPairData) {
                        this.algorithmType_ = BLDPracticeInputHandler.ALGORITHM_TYPES[1];
                        this.updateLetterPairWord_(this.algorithmType_);
                        const algorithm = this.getAlgorithm_(currentLetterPairData["corner_twist_alg"]);
                        this.updateAlgorithm_(algorithm);
                        this.displayCornerWhiteYellowSticker_(this.currentLetterPair_.charAt(0));
                        this.processAlg_(algorithm);
                    } else {
                        this.algorithmType_ = BLDPracticeInputHandler.ALGORITHM_TYPES[2];
                        this.updateLetterPairWord_(this.algorithmType_);
                        this.updateAlgorithm_("");
                    }
                } else if (this.mode_ == 3) {
                    if ("edge_alg" in currentLetterPairData) {
                        this.algorithmType_ = BLDPracticeInputHandler.ALGORITHM_TYPES[3];
                        const algorithm = this.getAlgorithm_(currentLetterPairData["edge_alg"]);
                        this.updateAlgorithm_(algorithm);
                        this.processAlg_(algorithm);
                    } else if ("edge_flip_alg" in currentLetterPairData) {
                        this.algorithmType_ = BLDPracticeInputHandler.ALGORITHM_TYPES[4];
                        this.updateLetterPairWord_(this.algorithmType_);
                        const algorithm = this.getAlgorithm_(currentLetterPairData["edge_flip_alg"]);
                        this.updateAlgorithm_(algorithm);
                        this.processAlg_(algorithm);
                    } else {
                        this.algorithmType_ = BLDPracticeInputHandler.ALGORITHM_TYPES[5];
                        this.updateLetterPairWord_(this.algorithmType_);
                    }
                }
                break;
        }
    }

    handleTouch(controller, event) {
        let X = event.touches[0].pageX / window.innerWidth;
        let Y = event.touches[0].pageY / window.innerHeight;

        // Top half: Reset algorithm.
        // Bottom left corner: reverse previous sequence of current algorithm. If we're at the end of the current one, generate new algorithm.
        // Bottom right corner: execute next sequence of current algorithm.
        if (this.currentAlgorithmIndex_ != -1) {
            if (Y < 0.5) {
                if (X < 0.5) {
                    this.resetAlg_();
                } else {
                    if (this.currentAlgorithmIndex_ < this.currentAlgorithm_.length) {
                        this.applyAlg_();
                    } else if (!this.animation_.busy) {
                        let mode = Math.random() > 0.5 ? 3 : 2;
                        controller.switchMode_(mode);
                        this.selectRandomAlgorithm_();
                    }
                }
            } else {
                if (X > 0.5) {
                    if (this.currentAlgorithmIndex_ < this.currentAlgorithm_.length) {
                        this.executeNextSequence_();
                    } else if (!this.animation_.busy) {
                        let mode = Math.random() > 0.5 ? 3 : 2;
                        controller.switchMode_(mode);
                        this.selectRandomAlgorithm_();
                    }
                } else {
                    this.reversePreviousSequence_();
                }
            }
        } else if (!this.animation_.busy) {
            let mode = Math.random() > 0.5 ? 3 : 2;
            controller.switchMode_(mode);
            this.selectRandomAlgorithm_();
        }
    }

    getAlgorithm_(alg) {
        this.shouldInvert_ = this.currentLetterPair_.charAt(0) > this.currentLetterPair_.charAt(1);
        // algorithms written like "U M' U' M U2 M U M' U|U M U M' U2 M' U' M U" specify 2 different execution for one permutation and its inverse.
        if (!alg.includes('|')) {
            return alg;
        }
        if (!this.shouldInvert_) {
            return alg.split('|')[0];
        }
        this.shouldInvert_ = false;
        return alg.split('|')[1];
    }

    selectRandomAlgorithm_() {
        let keys = Object.keys(this.letterPairData_);
        let letterPair = keys[Math.floor(Math.random() * keys.length)];
        let data = this.letterPairData_[letterPair];
        if (this.mode_ == 2 && !data.hasOwnProperty("corner_alg") && !data.hasOwnProperty("corner_twist_alg") ||
            this.mode_ == 3 && !data.hasOwnProperty("edge_alg") && !data.hasOwnProperty("edge_flip_alg")) {
                return this.selectRandomAlgorithm_();
        }
        this.currentLetterPair_ = "";
        this.renderer_.clearOpaqueBufferData();
        if (this.mode_ == 2) {
            this.updateCornerSticker_("C", 1.0);
        } else if (this.mode_ == 3) {
            this.updateEdgeSticker_("C", 1.0);
        }
        this.handleInput(letterPair.charAt(0));
        this.handleInput(letterPair.charAt(1));
    }

    processAlg_(algorithm) {
        // Create groups of letters.
        let setup = null;
        let permutation_1 = null;
        let permutation_2 = null;
        let currentGroup = [];
        let currentLetter = "";
        for (var i = 0; i < algorithm.length; i++) {
            let char = algorithm.charAt(i);
            if (char == "[" || char == "(" || char == "]" || char == ")" || char == "*") {
                continue;
            } else if (char == ":") {
                if (currentLetter.length > 0) {
                    currentGroup.push(currentLetter);
                }
                if (currentGroup.length > 0) {
                    setup = currentGroup.slice();
                }
                currentGroup = [];
                currentLetter = ""
            } else if (char == ",") {
                if (currentLetter.length > 0) {
                    currentGroup.push(currentLetter);
                }
                if (currentGroup.length > 0) {
                    if (permutation_1) {
                        permutation_2 = currentGroup.slice();
                    } else {
                        permutation_1 = currentGroup.slice();
                    }
                }
                currentGroup = [];
                currentLetter = ""
            } else if (char == " ") {
                if (currentLetter.length > 0) {
                    currentGroup.push(currentLetter);
                }
                currentLetter = "";
            } else if (char == "2" && algorithm.charAt(i - 1) == "*") {
                if (currentLetter.length > 0) {
                    currentGroup.push(currentLetter);
                }
                if (currentGroup.length > 0) {
                    if (permutation_1) {
                        alert("Parsing error: Setup + permutation 1 + permutation 2 including '*2'")
                    } else {
                        currentGroup = currentGroup.concat(currentGroup);
                        permutation_1 = currentGroup.slice();
                    }
                    currentGroup = [];
                    currentLetter = ""
                }
                continue;
            } else {
                currentLetter += char;
            }
        }
        if (currentLetter.length > 0) {
            currentGroup.push(currentLetter);
        }
        if (currentGroup.length > 0) {
            if (!permutation_1) {
                permutation_1 = currentGroup.slice();
            } else if (!permutation_2) {
                permutation_2 = currentGroup.slice();
            } else {
                alert("Parsing error: more than 2 permutation groups")
            }
        }
        
        // Decompose algorithm
        this.currentAlgorithm_ = [];

        // Apply setup if applicable
        if (setup) {
            this.currentAlgorithm_.push(this.decomposeSequence_(setup));
        }

        // Apply permutations
        if (!permutation_2) {
            if (!permutation_1) {
                alert("Parsing error: no permutation");
                return;
            }
            // Edge flip algorithms do not need to be inverted
            this.currentAlgorithm_.push(this.algorithmType_ == BLDPracticeInputHandler.ALGORITHM_TYPES[4] || !this.shouldInvert_ ? this.decomposeSequence_(permutation_1) : this.invertSequence_(permutation_1));
        } else {
            let sequence_1;
            let sequence_2;
            // Corner twists already predefine cw and ccw algorithms
            if (this.algorithmType_ == BLDPracticeInputHandler.ALGORITHM_TYPES[1] || !this.shouldInvert_) {
                sequence_1 = permutation_1;
                sequence_2 = permutation_2;
            } else {
                sequence_1 = permutation_2;
                sequence_2 = permutation_1;
            }
            this.currentAlgorithm_.push(this.decomposeSequence_(sequence_1));
            this.currentAlgorithm_.push(this.decomposeSequence_(sequence_2));
            this.currentAlgorithm_.push(this.invertSequence_(sequence_1));
            this.currentAlgorithm_.push(this.invertSequence_(sequence_2));
        }

        // Cancel setup if applicable
        if (setup) {
            this.currentAlgorithm_.push(this.invertSequence_(setup));
        }

        this.simplifyCurrentAlgorithm_();

        for (var i = this.currentAlgorithm_.length - 1; i >= 0; i--) {
            this.animation_.applySequenceWithoutAnimation(this.invertSequence_(this.currentAlgorithm_[i]));
        }
        this.currentAlgorithmIndex_ = 0;
    }

    decomposeSequence_(sequence) {
        let decomposedSequence = [];
        for (var i in sequence) {
            // Decompose half turns.
            if (sequence[i].length > 1 && sequence[i].charAt(1) === "2") {
                let turn = sequence[i].replace("2", "");
                decomposedSequence.push(turn);
                decomposedSequence.push(turn);
                continue;
            }
            decomposedSequence.push(sequence[i]);
        }
        return decomposedSequence;
    }

    invertSequence_(sequence) {
        let invertedSequence = []
        for (var i = sequence.length - 1; i >= 0; i--) {
            let invertedMove = sequence[i];
            if (invertedMove.length == 0) {
                alert("Oops, empty move")
            } else if (invertedMove.charAt(invertedMove.length - 1) == "'") {
                invertedMove = invertedMove.slice(0, -1);
            } else {
                invertedMove += "'";
            }
            // Decompose half turns.
            if (invertedMove.length > 1 && invertedMove.charAt(1) == "2") {
                invertedMove = invertedMove.replace("2", "");
                // Apply first time.
                invertedSequence.push(invertedMove);
            }
            invertedSequence.push(invertedMove);
        }
        return invertedSequence;
    }

    simplifyCurrentAlgorithm_() {
        for (var i = 1; i < this.currentAlgorithm_.length; i++) {
            let sequence_1 = this.currentAlgorithm_[i - 1];
            let sequence_2 = this.currentAlgorithm_[i];
            while (sequence_1[sequence_1.length - 1].charAt(0) === sequence_2[0].charAt(0)) {
                if (sequence_1[sequence_1.length - 1].length !== sequence_2[0].length) {
                    // Moves that cancel each other (e.g. U and U').
                    sequence_1.pop();
                    sequence_2.shift();
                } else if (sequence_1.length > 1 && sequence_1[sequence_1.length - 2] === sequence_1[sequence_1.length - 1]) {
                    // 3 times the same turn (e.g. U, U, U becomes U').
                    sequence_1.pop();
                    sequence_2.shift();
                    // Invert last move of sequence_1.
                    let move = sequence_1[sequence_1.length - 1];
                    if (move.charAt(move.length - 1) == "'") {
                        move = move.slice(0, -1);
                    } else {
                        move += "'";
                    }
                    sequence_1[sequence_1.length - 1] = move;
                } else if (sequence_2.length > 1 && sequence_2[0] === sequence_2[1]) {
                    sequence_1.pop();
                    sequence_2.shift();
                    // Invert last move of sequence_2.
                    let move = sequence_2[0];
                    if (move.charAt(move.length - 1) == "'") {
                        move = move.slice(0, -1);
                    } else {
                        move += "'";
                    }
                    sequence_2[0] = move;
                } else {
                    break;
                }
                if (sequence_1.length == 0 || sequence_2.length == 0) {
                    break;
                }
            }
            // Remove empty sequences.
            if (sequence_1.length == 0) {
                this.currentAlgorithm_.splice(i - 1, 1);
                i--;
            }
            if (sequence_2.length == 0) {
                this.currentAlgorithm_.splice(i, 1);
                i--;
            }
            if (sequence_1.length == 0 && sequence_2.length == 0) {
                // This probably never happens.
                i++;
            }
        }
    }

    executeNextSequence_() {
        if (this.currentAlgorithmIndex_ == -1 || this.currentAlgorithmIndex_ == this.currentAlgorithm_.length) {
            return;
        }
        // Execute sequence and increment currentAlgorithmIndex_.
        let sequence = this.currentAlgorithm_[this.currentAlgorithmIndex_];
        for (var i in sequence) {
            this.animation_.addMove(sequence[i]);
        }
        this.currentAlgorithmIndex_++;
    }

    reversePreviousSequence_() {
        if (this.currentAlgorithmIndex_ <= 0) {
            return;
        }
        this.currentAlgorithmIndex_--;
        // Decrement currentAlgorithmIndex_ and execute inverted sequence.
        let sequence = this.invertSequence_(this.currentAlgorithm_[this.currentAlgorithmIndex_]);
        for (var i in sequence) {
            this.animation_.addMove(sequence[i]);
        }
    }

    resetAlg_() {
        if (this.currentAlgorithmIndex_ == -1 || this.animation_.busy) return;
        while (this.currentAlgorithmIndex_ > 0) {
            this.currentAlgorithmIndex_--;
            let sequence = this.invertSequence_(this.currentAlgorithm_[this.currentAlgorithmIndex_]);
            this.animation_.applySequenceWithoutAnimation(sequence);
        }
    }

    applyAlg_() {
        if (this.currentAlgorithmIndex_ == -1 || this.animation_.busy) return;
        while (this.currentAlgorithmIndex_ < this.currentAlgorithm_.length) {
            let sequence = this.currentAlgorithm_[this.currentAlgorithmIndex_];
            this.animation_.applySequenceWithoutAnimation(sequence);
            this.currentAlgorithmIndex_++;
        }
    }
}
