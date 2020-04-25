document.addEventListener("keydown", handleKeyDown, false);

const animationSpeed = 15;

// Moves
const currentRotation = {
    component: 0,
    direction: 0,  // The direction is used to select the face to rotate. If 0, the entire cube is rotated.
    multiplier: 0,
};
let currentRotationAngle = 0.0;
let piecesInRotation = [];
let nextMoves = [];
let busy = false;

const MOVES = [
    ["U", "U'"],
    ["D", "D'"],
    ["R", "R'"],
    ["L", "L'"],
    ["F", "F'"],
    ["B", "B'"],
];

function handleKeyDown(event) {
    switch(event.key) {
        case "i":
            nextMoves.push("R");
            break;
        case "k":
            nextMoves.push("R'");
            break;
        case "e":
            nextMoves.push("L'");
            break;
        case "d":
            nextMoves.push("L");
            break;
        case "j":
            nextMoves.push("U");
            break;
        case "f":
            nextMoves.push("U'");
            break;
        case "h":
            nextMoves.push("F");
            break;
        case "g":
            nextMoves.push("F'");
            break;
        case "l":
            nextMoves.push("D'");
            break;
        case "s":
            nextMoves.push("D");
            break;
        case "o":
            nextMoves.push("B'");
            break;
        case "w":
            nextMoves.push("B");
            break;
        case "b":
            nextMoves.push("X");
            break;
        case "n":
            nextMoves.push("X");
            break;
        case "t":
            nextMoves.push("X'");
            break;
        case "y":
            nextMoves.push("X'");
            break;
        case ";":
            nextMoves.push("Y");
            break;
        case "a":
            nextMoves.push("Y'");
            break;
        case "q":
            nextMoves.push("Z");
            break;
        case "p":
            nextMoves.push("Z'");
            break;
        case " ":
            scramble();
            break;
        case "Escape":
            resetCube();
            break;
        default:
            break;
    }
}

function updateState(deltaTime) {
    // Initialize or end move if needed.
    if (!busy && nextMoves.length !== 0) {
        const nextMove = nextMoves.shift();  // Retrieve next move from the nextMoves FIFO
        switch(nextMove) {
            case "R":
                currentRotation.component = 0;
                currentRotation.direction = 1;
                currentRotation.multiplier = -1;
                break;
            case "R'":
                currentRotation.component = 0;
                currentRotation.direction = 1;
                currentRotation.multiplier = 1;
                break;
            case "L":
                currentRotation.component = 0;
                currentRotation.direction = -1;
                currentRotation.multiplier = 1;
                break;
            case "L'":
                currentRotation.component = 0;
                currentRotation.direction = -1;
                currentRotation.multiplier = -1;
                break;
            case "U":
                currentRotation.component = 1;
                currentRotation.direction = 1;
                currentRotation.multiplier = 1;
                break;
            case "U'":
                currentRotation.component = 1;
                currentRotation.direction = 1;
                currentRotation.multiplier = -1;
                break;
            case "D":
                currentRotation.component = 1;
                currentRotation.direction = -1;
                currentRotation.multiplier = -1;
                break;
            case "D'":
                currentRotation.component = 1;
                currentRotation.direction = -1;
                currentRotation.multiplier = 1;
                break;
            case "F":
                currentRotation.component = 2;
                currentRotation.direction = 1;
                currentRotation.multiplier = -1;
                break;
            case "F'":
                currentRotation.component = 2;
                currentRotation.direction = 1;
                currentRotation.multiplier = 1;
                break;
            case "B":
                currentRotation.component = 2;
                currentRotation.direction = -1;
                currentRotation.multiplier = 1;
                break;
            case "B'":
                currentRotation.component = 2;
                currentRotation.direction = -1;
                currentRotation.multiplier = -1;
                break;
            case "X":
                currentRotation.component = 0;
                currentRotation.direction = 0;
                currentRotation.multiplier = 1;
                break;
            case "X'":
                currentRotation.component = 0;
                currentRotation.direction = 0;
                currentRotation.multiplier = -1;
                break;
            case "Y":
                currentRotation.component = 1;
                currentRotation.direction = 0;
                currentRotation.multiplier = 1;
                break;
            case "Y'":
                currentRotation.component = 1;
                currentRotation.direction = 0;
                currentRotation.multiplier = -1;
                break;
            case "Z":
                currentRotation.component = 2;
                currentRotation.direction = 0;
                currentRotation.multiplier = 1;
                break;
            case "Z'":
                currentRotation.component = 2;
                currentRotation.direction = 0;
                currentRotation.multiplier = -1;
                break;
            default:
                break;
        }
        initializeMove();
    }
    if (busy && currentRotationAngle + animationSpeed * deltaTime > Math.PI / 2) {
        endMove();
    }

    // Apply rotation if busy.
    if (busy) {
        currentRotationAngle += animationSpeed * deltaTime;
        applyMove();
    }
}

function initializeMove() {
    currentRotationAngle = 0.0;
    piecesInRotation = [];
    busy = true;
    
    // Define pieces to be rotated during animation
    for (p = 0; p < pieces.length; p++) {
        if (currentRotation.direction === 0 || currentRotation.direction === pieces[p].position[currentRotation.component]) {
            piecesInRotation.push(p);
        }
    }
}

function applyMove() {
    // Only update positionBufferData.
    let c = Math.cos(currentRotationAngle * currentRotation.multiplier);
    let s = Math.sin(currentRotationAngle * currentRotation.multiplier);
    let temp = vec3.create();
    const rotationMatrix = createRotationMatrix(currentRotation.component, c, s);

    for (i = 0; i < piecesInRotation.length; i++) {
        p = piecesInRotation[i];
        nSquares = pieces[p].squares.length;
        for (s = 0; s < nSquares; s++) {  // number of squares per corner/edge/center
            for (v = 0; v < 4; v++) {  // 4 vertices per square
                temp = applyRotation(rotationMatrix, pieces[p].squares[s][v]);
                for (c = 0; c < 3; c++) {  // 3 components per vertex
                    positionBufferData[p][s][v * 3 + c] = temp[c];
                }
            }
        }
    }
}

function endMove() {
    // Update pieces[p].position and positionBufferData.
    let c = 0; // Math.cos(90 * Math.PI / 180);
    let s = 1 * currentRotation.multiplier; // Math.sin(90 * Math.PI / 180);
    const rotationMatrix = createRotationMatrix(currentRotation.component, c, s);

    for (i = 0; i < piecesInRotation.length; i++) {
        p = piecesInRotation[i];
        pieces[p].position = applyRotation(rotationMatrix, pieces[p].position);
        nSquares = pieces[p].squares.length;
        for (s = 0; s < nSquares; s++) {  // number of squares per corner/edge/center
            for (v = 0; v < 4; v++) {  // 4 vertices per square
                pieces[p].squares[s][v] = applyRotation(rotationMatrix, pieces[p].squares[s][v]);
                for (c = 0; c < 3; c++) {  // 3 components per vertex
                    positionBufferData[p][s][v * 3 + c] = pieces[p].squares[s][v][c];
                }
            }
        }
    }
    
    busy = false;
}

function scramble() {
    resetCube();
    // God's number is 20. Choosing 35 because, with my scrambling algorithm, some configurations
    // may be more likely than others, and because double turns are not supported.
    const nScrambleMoves = 35;
    // Random index between 0 and 5.
    let nextMoveIndex = Math.floor(Math.random() * 6);
    for (i = 0; i < nScrambleMoves; i++) {
        nextMoves.push(MOVES[nextMoveIndex][Math.floor(Math.random() * 2)]);
        // (nextMove + Random index between 1 and 5) % 6 to ensure that the same face is not selected 2 times.
        nextMoveIndex = (nextMoveIndex + 1 + Math.floor(Math.random() * 4)) % 6;
    }
}

function resetCube() {
    initPieces();
    for (p = 0; p < pieces.length; p++) {
        nSquares = pieces[p].squares.length;
        for (s = 0; s < nSquares; s++) {  // number of squares per corner/edge/center
            for (v = 0; v < 4; v++) {  // 4 vertices per square
                for (c = 0; c < 3; c++) {  // 3 components per vertex
                    positionBufferData[p][s][v * 3 + c] = pieces[p].squares[s][v][c];
                }
            }
        }
    }
    nextMoves = [];
    busy = false;
}

function createRotationMatrix(component, c, s) {
    let rotationMatrix = null;
    if (component === 0) {
        rotationMatrix = mat3.fromValues(1, 0, 0, 0, c, s, 0, -s, c);
    } else if (component === 1) {
        rotationMatrix = mat3.fromValues(c, 0, s, 0, 1, 0, -s, 0, c);
    } else if (component === 2) {
        rotationMatrix = mat3.fromValues(c, s, 0, -s, c, 0, 0, 0, 1);
    }
    return rotationMatrix;
}
