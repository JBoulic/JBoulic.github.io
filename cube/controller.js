// This class handles user input 
class Controller {
    static mode = 1;

    static handleKeyDown(event) {
        switch(event.key) {
            case "1":
                Controller.switchMode(1);
                break;
            case "2":
                Controller.switchMode(2);
                break;
            case "3":
                Controller.switchMode(3);
                break;
            case "Escape":
                Animation.resetCube();
                break;
            default:
                if (Controller.mode == 1) {
                    SolveInputHandler.handleInput(event.key);
                } else {
                    BLDPracticeInputHanler.handleInput(event.key);
                }
                break;
        }
    }

    static switchMode(mode) {
        switch(mode) {
            case 2:
                Controller.mode = 2;
                Animation.animationSpeed = 5;
                document.getElementById("mode").innerHTML = "BLD corners";
                Animation.resetCube();
                updateLetterPair("");
                updateLetterPairWord("");
                updateAlgorithm("");
                Renderer.clearOpaqueBufferData();
                Model.updateCornerSticker("C", 1.0);
                break;
            case 3:
                Controller.mode = 3;
                Animation.animationSpeed = 5;
                document.getElementById("mode").innerHTML = "BLD edges";
                Animation.resetCube();
                updateLetterPair("");
                updateLetterPairWord("");
                updateAlgorithm("");
                Renderer.clearOpaqueBufferData();
                Model.updateEdgeSticker("C", 1.0);
                break;
            default:
                Controller.mode = 1;
                Animation.animationSpeed = 15;
                document.getElementById("mode").innerHTML = "Solve mode";
                updateLetterPair("");
                updateLetterPairWord("");
                updateAlgorithm("");
                break;
        }
        gl.uniform1i(Renderer.programInfo.uniformLocations.solveMode, Controller.mode);
    }

    static handleTouch(event) {
        let X = event.touches[0].pageX / canvas.offsetWidth;
        let Y = event.touches[0].pageY / canvas.offsetHeight;

        // Top half: Reset algorithm.
        // Bottom left corner: reverse previous sequence of current algorithm. If we're at the end of the current one, generate new algorithm.
        // Bottom right corner: execute next sequence of current algorithm.
        if ((Controller.mode == 2 || Controller.mode == 3) && BLDPracticeInputHanler.currentAlgorithmIndex != -1) {
            if (Y < 0.5) {
                if (X < 0.5) {
                    BLDPracticeInputHanler.resetAlg();
                } else {
                    if (BLDPracticeInputHanler.currentAlgorithmIndex < BLDPracticeInputHanler.currentAlgorithm.length) {
                        BLDPracticeInputHanler.applyAlg();
                    } else if (!Animation.busy) {
                        let mode = Math.random() > 0.5 ? 3 : 2;
                        Controller.switchMode(mode);
                        BLDPracticeInputHanler.selectRandomAlgorithm();
                    }
                }
            } else {
                if (X > 0.5) {
                    if (BLDPracticeInputHanler.currentAlgorithmIndex < BLDPracticeInputHanler.currentAlgorithm.length) {
                        BLDPracticeInputHanler.executeNextSequence();
                    } else if (!Animation.busy) {
                        let mode = Math.random() > 0.5 ? 3 : 2;
                        Controller.switchMode(mode);
                        BLDPracticeInputHanler.selectRandomAlgorithm();
                    }
                } else {
                    BLDPracticeInputHanler.reversePreviousSequence();
                }
            }
        } else if (!Animation.busy) {
            let mode = Math.random() > 0.5 ? 3 : 2;
            Controller.switchMode(mode);
            BLDPracticeInputHanler.selectRandomAlgorithm();
        }
    }
}


// Input handling in solve mode
class SolveInputHandler {

    static handleInput(key) {
        switch(key) {
            case "i":
                Animation.addMove("R");
                break;
            case "k":
                Animation.addMove("R'");
                break;
            case "e":
                Animation.addMove("L'");
                break;
            case "d":
                Animation.addMove("L");
                break;
            case "j":
                Animation.addMove("U");
                break;
            case "f":
                Animation.addMove("U'");
                break;
            case "h":
                Animation.addMove("F");
                break;
            case "g":
                Animation.addMove("F'");
                break;
            case "l":
                Animation.addMove("D'");
                break;
            case "s":
                Animation.addMove("D");
                break;
            case "o":
                Animation.addMove("B'");
                break;
            case "w":
                Animation.addMove("B");
                break;
            case "u":
                Animation.addMove("r");
                break;
            case "m":
                Animation.addMove("r'");
                break;
            case "r":
                Animation.addMove("l'");
                break;
            case "v":
                Animation.addMove("l");
                break;
            case "t":
                Animation.addMove("x");
                break;
            case "y":
                Animation.addMove("x");
                break;
            case "b":
                Animation.addMove("x'");
                break;
            case "n":
                Animation.addMove("x'");
                break;
            case ";":
                Animation.addMove("y");
                break;
            case "a":
                Animation.addMove("y'");
                break;
            case "p":
                Animation.addMove("z");
                break;
            case "q":
                Animation.addMove("z'");
                break;
            case " ":
                this.scramble();
                break;
            default:
                break;
        }
    }

    static scramble() {
        const MOVES = [
            ["U", "U'"],
            ["D", "D'"],
            ["R", "R'"],
            ["L", "L'"],
            ["F", "F'"],
            ["B", "B'"],
        ];
        Animation.resetCube();
        // God's number is 20. Choosing 35 because, with my scrambling algorithm, some configurations
        // may be more likely than others, and because double turns are not supported.
        const nScrambleMoves = 35;
        // Random index between 0 and 5.
        let nextMoveIndex = Math.floor(Math.random() * 6);
        for (var i = 0; i < nScrambleMoves; i++) {
            Animation.addMove(MOVES[nextMoveIndex][Math.floor(Math.random() * 2)]);
            // (nextMove + Random index between 1 and 5) % 6 to ensure that the same face is not selected 2 times.
            nextMoveIndex = (nextMoveIndex + 1 + Math.floor(Math.random() * 4)) % 6;
        }
    }
}


// Input handling in BLD practice mode
class BLDPracticeInputHanler {
    static currentLetterPair = "";
    static letterPairData = JSON.parse(json_data);

    static ALGORITHM_TYPES = ["Corners", "Corner twist", "No corner alg", "Edges", "Edge flip", "No edge alg"];
    static algorithmType = "";
    static currentAlgorithm = [];
    static currentAlgorithmIndex = -1;

    static handleInput(key) {
        switch(key) {
            case " ":
                this.selectRandomAlgorithm();
                break;
            case "ArrowRight":
                this.executeNextSequence();
                break;
            case "ArrowLeft":
                this.reversePreviousSequence();
                break;
            case "Backspace":
                this.resetAlg();
                break;
            default:
                if (key.length != 1 || !/[a-zA-Z]/.test(key)) {
                    break;
                }
                if (this.currentAlgorithmIndex != -1) {
                    Animation.resetCube();
                    this.currentAlgorithmIndex = -1;
                }
                // Clear letter pair word and algorithm.
                updateLetterPairWord("");
                updateAlgorithm("");
                let letter = key.toUpperCase();
                // Update letterPair.
                if (this.currentLetterPair.length < 2) {
                    this.currentLetterPair += letter;
                } else {
                    this.currentLetterPair = letter;
                    Renderer.clearOpaqueBufferData();
                    if (Controller.mode == 2) {
                        Model.updateCornerSticker("C", 1.0);
                    } else if (Controller.mode == 3) {
                        Model.updateEdgeSticker("C", 1.0);
                    }
                }
                // Save user input for UI display.
                let uiLetterPair = this.currentLetterPair
                // Replace Z with X when relevant.
                letter = letter.replace('Z', 'X')
                if (this.currentLetterPair.length == 2) {
                    this.currentLetterPair = this.currentLetterPair.replace('Z', 'X')
                }
                // Reject invalid input if we have a pair of letters.
                if (this.currentLetterPair.length == 2 && this.currentLetterPair in this.letterPairData == false) {
                    updateLetterPair(uiLetterPair + ": invalid input");
                    break;
                }
                // Update sticker.
                updateLetterPair(uiLetterPair);
                if (Controller.mode == 2) {
                    Model.updateCornerSticker(letter, 1.0);
                } else if (Controller.mode == 3) {
                    Model.updateEdgeSticker(letter, 1.0);
                }
                // Continue only if we have a valid letter pair word.
                if (this.currentLetterPair.length != 2) break;
                // Update UI.
                let currentLetterPairData = this.letterPairData[this.currentLetterPair];
                if (currentLetterPairData.hasOwnProperty("word") && currentLetterPairData["word"].length > 0) {
                    updateLetterPairWord(currentLetterPairData["word"]);
                }
                if (Controller.mode == 2) {
                    if ("corner_alg" in currentLetterPairData) {
                        this.algorithmType = this.ALGORITHM_TYPES[0];
                        updateAlgorithm(currentLetterPairData["corner_alg"]);
                        this.processAlg(currentLetterPairData["corner_alg"]);
                    } else if ("corner_twist_alg" in currentLetterPairData) {
                        this.algorithmType = this.ALGORITHM_TYPES[1];
                        updateLetterPairWord(this.algorithmType);
                        updateAlgorithm(currentLetterPairData["corner_twist_alg"]);
                        Model.displayCornerWhiteYellowSticker(this.currentLetterPair.charAt(0));
                        this.processAlg(currentLetterPairData["corner_twist_alg"]);
                    } else {
                        this.algorithmType = this.ALGORITHM_TYPES[2];
                        updateLetterPairWord(this.algorithmType);
                        updateAlgorithm("");
                    }
                } else if (Controller.mode == 3) {
                    if ("edge_alg" in currentLetterPairData) {
                        this.algorithmType = this.ALGORITHM_TYPES[3];
                        updateAlgorithm(currentLetterPairData["edge_alg"]);
                        this.processAlg(currentLetterPairData["edge_alg"]);
                    } else if ("edge_flip_alg" in currentLetterPairData) {
                        this.algorithmType = this.ALGORITHM_TYPES[4];
                        updateLetterPairWord(this.algorithmType);
                        updateAlgorithm(currentLetterPairData["edge_flip_alg"]);
                        this.processAlg(currentLetterPairData["edge_flip_alg"]);
                    } else {
                        this.algorithmType = this.ALGORITHM_TYPES[5];
                        updateLetterPairWord(this.algorithmType);
                    }
                }
                break;
        }
    }

    static selectRandomAlgorithm() {
        let keys = Object.keys(this.letterPairData);
        let letterPair = keys[Math.floor(Math.random() * keys.length)];
        let data = this.letterPairData[letterPair];
        if (Controller.mode == 2 && !data.hasOwnProperty("corner_alg") && !data.hasOwnProperty("corner_twist_alg") ||
            Controller.mode == 3 && !data.hasOwnProperty("edge_alg") && !data.hasOwnProperty("edge_flip_alg")) {
                return this.selectRandomAlgorithm();
        }
        this.currentLetterPair = "";
        Renderer.clearOpaqueBufferData();
        if (Controller.mode == 2) {
            Model.updateCornerSticker("C", 1.0);
        } else if (Controller.mode == 3) {
            Model.updateEdgeSticker("C", 1.0);
        }
        this.handleInput(letterPair.charAt(0));
        this.handleInput(letterPair.charAt(1));
    }

    static processAlg(algorithm) {
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
        this.currentAlgorithm = [];

        // Apply setup if applicable
        if (setup) {
            this.currentAlgorithm.push(this.decomposeSequence(setup));
        }

        // Apply permutations
        if (!permutation_2) {
            if (!permutation_1) {
                alert("Parsing error: no permutation");
                return;
            }
            // Edge flip algorithms do not need to be inverted
            this.currentAlgorithm.push(this.algorithmType == this.ALGORITHM_TYPES[4] || this.currentLetterPair.charAt(0) < this.currentLetterPair.charAt(1) ? this.decomposeSequence(permutation_1) : this.invertSequence(permutation_1));
        } else {
            let sequence_1;
            let sequence_2;
            // Corner twists already predefine cw and ccw algorithms
            if (this.algorithmType == this.ALGORITHM_TYPES[1] || this.currentLetterPair.charAt(0) < this.currentLetterPair.charAt(1)) {
                sequence_1 = permutation_1;
                sequence_2 = permutation_2;
            } else {
                sequence_1 = permutation_2;
                sequence_2 = permutation_1;
            }
            this.currentAlgorithm.push(this.decomposeSequence(sequence_1));
            this.currentAlgorithm.push(this.decomposeSequence(sequence_2));
            this.currentAlgorithm.push(this.invertSequence(sequence_1));
            this.currentAlgorithm.push(this.invertSequence(sequence_2));
        }

        // Cancel setup if applicable
        if (setup) {
            this.currentAlgorithm.push(this.invertSequence(setup));
        }

        this.simplifyCurrentAlgorithm();

        for (var i = this.currentAlgorithm.length - 1; i >= 0; i--) {
            Animation.applySequenceWithoutAnimation(this.invertSequence(this.currentAlgorithm[i]));
        }
        this.currentAlgorithmIndex = 0;
    }

    static decomposeSequence(sequence) {
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

    static invertSequence(sequence) {
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

    static simplifyCurrentAlgorithm() {
        for (var i = 1; i < this.currentAlgorithm.length; i++) {
            let sequence_1 = this.currentAlgorithm[i - 1];
            let sequence_2 = this.currentAlgorithm[i];
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
                this.currentAlgorithm.splice(i - 1, 1);
                i--;
            }
            if (sequence_2.length == 0) {
                this.currentAlgorithm.splice(i, 1);
                i--;
            }
            if (sequence_1.length == 0 && sequence_2.length == 0) {
                // This probably never happens.
                i++;
            }
        }
    }

    static executeNextSequence() {
        if (this.currentAlgorithmIndex == -1 || this.currentAlgorithmIndex == this.currentAlgorithm.length) {
            return;
        }
        // Execute sequence and increment currentAlgorithmIndex.
        let sequence = this.currentAlgorithm[this.currentAlgorithmIndex];
        for (var i in sequence) {
            Animation.addMove(sequence[i]);
        }
        this.currentAlgorithmIndex++;
    }

    static reversePreviousSequence() {
        if (this.currentAlgorithmIndex <= 0) {
            return;
        }
        this.currentAlgorithmIndex--;
        // Decrement currentAlgorithmIndex and execute inverted sequence.
        let sequence = this.invertSequence(this.currentAlgorithm[this.currentAlgorithmIndex]);
        for (var i in sequence) {
            Animation.addMove(sequence[i]);
        }
    }

    static resetAlg() {
        if (this.currentAlgorithmIndex == -1 || Animation.busy) return;
        while (this.currentAlgorithmIndex > 0) {
            this.currentAlgorithmIndex--;
            let sequence = this.invertSequence(this.currentAlgorithm[this.currentAlgorithmIndex]);
            Animation.applySequenceWithoutAnimation(sequence);
        }
    }

    static applyAlg() {
        if (this.currentAlgorithmIndex == -1 || Animation.busy) return;
        while (this.currentAlgorithmIndex < this.currentAlgorithm.length) {
            let sequence = this.currentAlgorithm[this.currentAlgorithmIndex];
            Animation.applySequenceWithoutAnimation(sequence);
            this.currentAlgorithmIndex++;
        }
    }
}
