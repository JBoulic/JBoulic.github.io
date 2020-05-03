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
                document.getElementById("mode").innerHTML = "BLD corner practice mode<br><br>";
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
                document.getElementById("mode").innerHTML = "BLD edge practice mode<br><br>";
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
                document.getElementById("mode").innerHTML = "Solve mode<br><br>";
                updateLetterPair("");
                updateLetterPairWord("");
                updateAlgorithm("");
                break;
        }
        gl.uniform1i(Renderer.programInfo.uniformLocations.solveMode, Controller.mode);
    }

    static handleTouch(event) {
        if ((Controller.mode == 2 || Controller.mode == 3) && BLDPracticeInputHanler.currentAlgorithmIndex != -1 && (BLDPracticeInputHanler.currentAlgorithmIndex < BLDPracticeInputHanler.currentAlgorithm.length)) {
            BLDPracticeInputHanler.executeNextSequence();
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
            case "b":
                Animation.addMove("x");
                break;
            case "n":
                Animation.addMove("x");
                break;
            case "t":
                Animation.addMove("x'");
                break;
            case "y":
                Animation.addMove("x'");
                break;
            case "a":
                Animation.addMove("y");
                break;
            case ";":
                Animation.addMove("y'");
                break;
            case "q":
                Animation.addMove("z");
                break;
            case "p":
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
                if (key.length != 1 || !/[a-zA-Z]/.test(key) || key == "y" || key == "z") {
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
                // Reject invalid input if we have a pair of letters.
                if (this.currentLetterPair.length == 2 && this.currentLetterPair in this.letterPairData == false) {
                    updateLetterPair(this.currentLetterPair + ": invalid input");
                    break;
                }
                // Update sticker.
                updateLetterPair(this.currentLetterPair);
                if (Controller.mode == 2) {
                    Model.updateCornerSticker(letter, 1.0);
                } else if (Controller.mode == 3) {
                    Model.updateEdgeSticker(letter, 1.0);
                }
                // Continue only if we have a valid letter pair word.
                if (this.currentLetterPair.length != 2) break;
                // Update UI.
                let currentLetterPairData = this.letterPairData[this.currentLetterPair];
                let s = currentLetterPairData["word"].length > 0 ? currentLetterPairData["word"] : " *Need to find a word*";
                updateLetterPairWord(s);
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
                        updateAlgorithm(currentLetterPairData["corner_alg"]);
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
        let groups = []
        let currentGroup = []
        let currentLetter = ""
        for (var i = 0; i < algorithm.length; i++) {
            let char = algorithm.charAt(i)
            if (char == "[" || char == "(") {
                if (currentLetter.length > 0) {
                    currentGroup.push(currentLetter);
                }
                if (currentGroup.length > 0) {
                    groups.push(currentGroup.slice());
                }
                currentGroup = [];
                currentLetter = "";
                continue
            } else if (char == "]" || char == ":" || char == ")" || char == "*") {
                continue;
            } else if (char == ",") {
                if (currentLetter.length > 0) {
                    currentGroup.push(currentLetter);
                }
                if (currentGroup.length > 0) {
                    groups.push(currentGroup.slice());
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
                    currentGroup = currentGroup.concat(currentGroup);
                    groups.push(currentGroup.slice());
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
            groups.push(currentGroup.slice());
        }
        
        // Decompose algorithm
        this.currentAlgorithm = [];
        let setup_sequence;
        let sequence_1;
        let sequence_2;
        switch (groups.length) {
            case 1:
                // Algorithm already processed
                this.currentAlgorithm = this.currentLetterPair.charAt(0) < this.currentLetterPair.charAt(1) ? [this.decomposeSequence(groups[0])] : [this.invertSequence(groups[0])];
                break;
            case 2:
                // Ex: corner AG
                sequence_1 = this.currentLetterPair.charAt(0) < this.currentLetterPair.charAt(1) ? groups[0] : groups[1];
                sequence_2 = this.currentLetterPair.charAt(0) < this.currentLetterPair.charAt(1) ? groups[1] : groups[0];
                if (this.algorithmType == this.ALGORITHM_TYPES[1]) {
                    sequence_1 = groups[0];
                    sequence_2 = groups[1];
                }
                this.currentAlgorithm.push(this.decomposeSequence(sequence_1));
                this.currentAlgorithm.push(this.decomposeSequence(sequence_2));
                this.currentAlgorithm.push(this.invertSequence(sequence_1));
                this.currentAlgorithm.push(this.invertSequence(sequence_2));
                break;
            case 3:
                // Ex: corner
                setup_sequence = groups[0]
                sequence_1 = this.currentLetterPair.charAt(0) < this.currentLetterPair.charAt(1) ? groups[1] : groups[2];
                sequence_2 = this.currentLetterPair.charAt(0) < this.currentLetterPair.charAt(1) ? groups[2] : groups[1];
                if (this.algorithmType == this.ALGORITHM_TYPES[1]) {
                    sequence_1 = groups[1];
                    sequence_2 = groups[2];
                }
                this.currentAlgorithm.push(this.decomposeSequence(setup_sequence));
                this.currentAlgorithm.push(this.decomposeSequence(sequence_1));
                this.currentAlgorithm.push(this.decomposeSequence(sequence_2));
                this.currentAlgorithm.push(this.invertSequence(sequence_1));
                this.currentAlgorithm.push(this.invertSequence(sequence_2));
                this.currentAlgorithm.push(this.invertSequence(setup_sequence));
                break;
            default:
                return "Malformed parsed algorithm: " + groups.toString();
        }
        this.currentAlgorithmIndex = 0;
        this.simplifyCurrentAlgorithm();
        for (var i = this.currentAlgorithm.length - 1; i >= 0; i--) {
            Animation.applySequenceWithoutAnimation(this.invertSequence(this.currentAlgorithm[i]));
        }
    }

    static decomposeSequence(sequence) {
        let decomposedSequence = [];
        for (var i in sequence) {
            // Decompose half turns.
            if (sequence[i].length > 1 && sequence[i].charAt(1) == "2") {
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
            while (sequence_1[sequence_1.length - 1].charAt(0) == sequence_2[0].charAt(0)) {
                if (sequence_1[sequence_1.length - 1].length != sequence_2[0].length) {
                    // Moves that cancel each other (e.g. U and U').
                    sequence_1.pop();
                    sequence_2.shift();
                } else if (sequence_1.length > 1 && sequence_1[sequence_1.length - 2].charAt(0) == sequence_1[sequence_1.length - 1].charAt(0)) {
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
                } else if (sequence_2.length > 1 && sequence_2[sequence_2.length - 2].charAt(0) == sequence_2[sequence_2.length - 1].charAt(0)) {
                    sequence_1.pop();
                    sequence_2.shift();
                    // Invert last move of sequence_2.
                    let move = sequence_2[sequence_2.length - 1];
                    if (move.charAt(move.length - 1) == "'") {
                        move = move.slice(0, -1);
                    } else {
                        move += "'";
                    }
                    sequence_2[sequence_2.length - 1] = move;
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
        if (this.currentAlgorithmIndex == -1) return;
        while (this.currentAlgorithmIndex > 0) {
            this.currentAlgorithmIndex--;
            let sequence = this.invertSequence(this.currentAlgorithm[this.currentAlgorithmIndex]);
            Animation.applySequenceWithoutAnimation(sequence);
        }
    }
}
