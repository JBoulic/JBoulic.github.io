// This class handles user input 
class Controller {
    static mode = 1;

    static handleKeyDown(event) {
        switch(event.key) {
            case "1":
                Controller.mode = 1;
                Controller.updateMode();
                document.getElementById("letterPair").innerHTML = "";
                document.getElementById("letterPairWord").innerHTML = "";
                document.getElementById("cornerAlg").innerHTML = "";
                document.getElementById("edgeAlg").innerHTML = "";
                document.getElementById("processedAlg").innerHTML = "";
                break;
            case "2":
                Controller.mode = 2;
                Controller.updateMode();
                document.getElementById("letterPair").innerHTML = "Letter pair: ";
                document.getElementById("letterPairWord").innerHTML = "Letter pair word: <br><br>";
                document.getElementById("cornerAlg").innerHTML = "Corner algorithm: ";
                document.getElementById("edgeAlg").innerHTML = "";
                document.getElementById("processedAlg").innerHTML = "Processed: ";
                break;
            case "3":
                Controller.mode = 3;
                Controller.updateMode();
                document.getElementById("letterPair").innerHTML = "Letter pair: ";
                document.getElementById("letterPairWord").innerHTML = "Letter pair word: <br><br>";
                document.getElementById("cornerAlg").innerHTML = "";
                document.getElementById("edgeAlg").innerHTML = "Edge algorithm: ";
                document.getElementById("processedAlg").innerHTML = "Processed: ";
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

    static updateMode() {
        gl.uniform1i(Renderer.programInfo.uniformLocations.solveMode, Controller.mode);
        switch(Controller.mode) {
            case 1:
                document.getElementById("mode").innerHTML = "Solve mode<br><br>";
                break;
            case 2:
                document.getElementById("mode").innerHTML = "BLD corner practice mode<br><br>";
                break;
            case 3:
                document.getElementById("mode").innerHTML = "BLD edge practice mode<br><br>";
                break;
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
            case "b":
                Animation.addMove("X");
                break;
            case "n":
                Animation.addMove("X");
                break;
            case "t":
                Animation.addMove("X'");
                break;
            case "y":
                Animation.addMove("X'");
                break;
            case ";":
                Animation.addMove("Y");
                break;
            case "a":
                Animation.addMove("Y'");
                break;
            case "q":
                Animation.addMove("Z");
                break;
            case "p":
                Animation.addMove("Z'");
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
    static currentAlgorithm = [];
    static currentAlgorithmIndex = -1;

    static handleInput(key) {
        switch(key) {
            case " ":
                break;
            case "ArrowRight":
                this.executeNextSequence();
                break;
            case "ArrowLeft":
                this.reversePreviousSequence();
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
                document.getElementById("letterPairWord").innerHTML = "Letter pair word: <br><br>";
                if (Controller.mode == 2) {
                    document.getElementById("cornerAlg").innerHTML = "Corner algorithm: ";   
                } else {
                    document.getElementById("edgeAlg").innerHTML = "Edge algorithm: ";
                }
                let letter = key.toUpperCase();
                // Update letterPair.
                if (this.currentLetterPair.length < 2) {
                    this.currentLetterPair += letter;
                } else {
                    this.currentLetterPair = letter;
                    Renderer.clearOpaqueBufferData();
                }
                // Reject invalid input if we have a pair of letters.
                if (this.currentLetterPair.length == 2 && this.currentLetterPair in this.letterPairData == false) {
                    document.getElementById("letterPair").innerHTML = "Letter pair " + this.currentLetterPair + ": invalid input";
                    break;
                }
                // Update sticker.
                if (letter in Model.CORNER_NAME_TO_POSITION == false) {
                    document.getElementById("letterPair").innerHTML = "Letter pair: " + this.currentLetterPair + " (invalid input or associated sticker not enabled yet)";
                } else {
                    document.getElementById("letterPair").innerHTML = "Letter pair: " + this.currentLetterPair;
                    if (Controller.mode == 2) {
                        Model.updateCornerSticker(letter, 1.0);
                    } else {
                        // Model.updateEdgeSticker
                    }
                }
                // Continue only if we have a valid letter pair word.
                if (this.currentLetterPair.length != 2) break;
                // Update UI.
                let currentLetterPairData = this.letterPairData[this.currentLetterPair];
                let s = currentLetterPairData["word"].length > 0 ? currentLetterPairData["word"] : " *Need to find a word*";
                document.getElementById("letterPairWord").innerHTML = "Letter pair word: " + s + "<br><br>";
                if (Controller.mode == 2) {
                    if ("corner_alg" in currentLetterPairData) {
                        document.getElementById("cornerAlg").innerHTML = "Corner algorithm: " + currentLetterPairData["corner_alg"];
                        document.getElementById("processedAlg").innerHTML = "Processed: " + this.processAlg(currentLetterPairData["corner_alg"]);
                    } else if ("corner_twist_alg" in currentLetterPairData) {
                        document.getElementById("cornerAlg").innerHTML = "Corner twist algorithm: " + currentLetterPairData["corner_twist_alg"];
                        document.getElementById("processedAlg").innerHTML = "Processed: " + this.processAlg(currentLetterPairData["corner_twist_alg"]);
                    } else {
                        document.getElementById("cornerAlg").innerHTML = "No algorithm";
                    }
                } else if (Controller.mode == 3) {
                    if ("edge_alg" in currentLetterPairData) {
                        document.getElementById("edgeAlg").innerHTML = "Edge algorithm: " + currentLetterPairData["edge_alg"];
                        document.getElementById("processedAlg").innerHTML = "Processed: " + this.processAlg(currentLetterPairData["edge_alg"]);
                    } else if ("edge_flip_alg" in currentLetterPairData) {
                        document.getElementById("edgeAlg").innerHTML = "Edge flip algorithm: " + currentLetterPairData["edge_flip_alg"];
                        document.getElementById("processedAlg").innerHTML = "Processed: " + this.processAlg(currentLetterPairData["edge_flip_alg"]);
                    } else {
                        document.getElementById("edgeAlg").innerHTML = "No algorithm";
                    }
                }
                break;
        }
    }

    static processAlg(algorithm) {
        // Create groups of letters.
        let groups = []
        let currentGroup = []
        let currentLetter = ""
        for (var i = 0; i < algorithm.length; i++) {
            let char = algorithm.charAt(i)
            if (char == "[") {
                if (currentLetter.length > 0) {
                    currentGroup.push(currentLetter)
                }
                if (currentGroup.length > 0) {
                    groups.push(currentGroup.slice())
                }
                currentGroup = [];
                currentLetter = ""
                continue
            } else if (char == "]" || char == ":") {
                continue;
            } else if (char == ",") {
                currentGroup.push(currentLetter)
                groups.push(currentGroup.slice())
                currentGroup = [];
                currentLetter = ""
            } else if (char == " ") {
                if (currentLetter.length > 0) {
                    currentGroup.push(currentLetter);
                }
                currentLetter = "";
            } else {
                currentLetter += char;
            }
        }
        if (currentLetter.length > 0) {
            currentGroup.push(currentLetter)
        }
        if (currentGroup.length > 0) {
            groups.push(currentGroup.slice())
        }
        
        // Decompose algorithm
        this.currentAlgorithm = []
        let setup_sequence;
        let sequence_1;
        let sequence_2;
        switch (groups.length) {
            case 1:
                // Algorithm already processed
                this.currentAlgorithm = [groups];
                break;
            case 2:
                // Ex: corner AG
                sequence_1 = this.currentLetterPair.charAt(0) < this.currentLetterPair.charAt(1) ? groups[0] : groups[1];
                sequence_2 = this.currentLetterPair.charAt(0) < this.currentLetterPair.charAt(1) ? groups[1] : groups[0];
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
        return this.currentAlgorithm;
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
            while (sequence_1[sequence_1.length - 1].charAt(0) == sequence_2[0].charAt(0) && sequence_1[sequence_1.length - 1].length != sequence_2[0].length) {
                sequence_1.pop();
                sequence_2.shift();
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
}
