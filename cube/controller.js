// This class handles user input 
class Controller {
    static mode = 1;

    static handleKeyDown(event) {
        switch(event.key) {
            case "1":
                Controller.mode = 1;
                gl.uniform1i(Renderer.programInfo.uniformLocations.solveMode, Controller.mode);
                break;
            case "2":
                Controller.mode = 2;
                gl.uniform1i(Renderer.programInfo.uniformLocations.solveMode, Controller.mode);
                break;
            case "Escape":
                Animation.resetCube();
                break;
            default:
                if (Controller.mode == 1) {
                    SolveInputHandler.handleInput(event.key);
                } else if (Controller.mode == 2) {
                    BLDPracticeInputHanler.handleInput(event.key);
                }
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
    handleInput(key) {
        switch(key) {
            case " ":
                scramble();
                break;
            default:
                break;
        }
    }
}
