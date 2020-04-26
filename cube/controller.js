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
                break;
            case "2":
                Controller.mode = 2;
                Controller.updateMode();
                document.getElementById("letterPair").innerHTML = "Letter pair: ";
                document.getElementById("letterPairWord").innerHTML = "Letter pair word: <br><br>";
                document.getElementById("cornerAlg").innerHTML = "Corner algorithm: ";
                document.getElementById("edgeAlg").innerHTML = "";
                break;
            case "3":
                Controller.mode = 3;
                Controller.updateMode();
                document.getElementById("letterPair").innerHTML = "Letter pair: ";
                document.getElementById("letterPairWord").innerHTML = "Letter pair word: <br><br>";
                document.getElementById("cornerAlg").innerHTML = "";
                document.getElementById("edgeAlg").innerHTML = "Edge algorithm: ";
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

    static handleInput(key) {
        switch(key) {
            case " ":
                scramble();
                break;
            default:
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
                    } else if ("corner_twist_alg" in currentLetterPairData) {
                        document.getElementById("cornerAlg").innerHTML = "Corner twist algorithm: " + currentLetterPairData["corner_twist_alg"];
                    } else {
                        document.getElementById("cornerAlg").innerHTML = "No algorithm";
                    }
                    // Apply algorithm.

                } else if (Controller.mode == 3) {
                    if ("edge_alg" in currentLetterPairData) {
                        document.getElementById("edgeAlg").innerHTML = "Edge algorithm: " + currentLetterPairData["edge_alg"];
                    } else if ("edge_flip_alg" in currentLetterPairData) {
                        document.getElementById("edgeAlg").innerHTML = "Edge flip algorithm: " + currentLetterPairData["edge_flip_alg"];
                    } else {
                        document.getElementById("edgeAlg").innerHTML = "No algorithm";
                    }
                    // Apply algorithm.

                }
                break;
        }
    }
}
