// This class handles the animation of the cube
class Animation {
    static animationSpeed = 5;

    // Moves
    static currentRotation = {
        component: 0,  // 0, 1, 2 -> x, y, z.
        layers: [],  // layers to rotate, 0 being the inner layer and -1, 1 the outer ones.
        direction: 0,   // 1 is clockwise, -1 is anti-clockwise.
    };
    static currentRotationAngle = 0.0;
    static piecesInRotation = [];
    static nextMoves = [];
    static busy = false;

    static addMove(move) {
        this.nextMoves.push(move);
    }

    static updateState(deltaTime) {
        // Initialize or end move if needed.
        if (!this.busy && this.nextMoves.length !== 0) {
            this.updateNextMove(this.nextMoves.shift());  // Retrieve next move from the nextMoves FIFO and update next move.
            this.busy = true;
        }
        if (this.busy && this.currentRotationAngle + this.animationSpeed * deltaTime > Math.PI / 2) {
            this.endMove();
        }
    
        // Apply rotation if busy.
        if (this.busy) {
            this.currentRotationAngle += this.animationSpeed * deltaTime;
            this.applyMove();
        }
    }

    static updateNextMove(move) {

        function updateRotation(component, layers, direction) {
            Animation.currentRotation.component = component;
            Animation.currentRotation.layers = layers;
            Animation.currentRotation.direction = direction;
        }

        switch(move) {
            case "R":
                updateRotation(0, [1], -1);
                break;
            case "R'":
                updateRotation(0, [1], 1);
                break;
            case "M":
                updateRotation(0, [0], 1);
                break;
            case "M'":
                updateRotation(0, [0], -1);
                break;
            case "L":
                updateRotation(0, [-1], 1);
                break;
            case "L'":
                updateRotation(0, [-1], -1);
                break;
            case "U":
                updateRotation(1, [1], -1);
                break;
            case "U'":
                updateRotation(1, [1], 1);
                break;
            case "E":
                updateRotation(1, [0], 1);
                break;
            case "E'":
                updateRotation(1, [0], -1);
                break;
            case "D":
                updateRotation(1, [-1], 1);
                break;
            case "D'":
                updateRotation(1, [-1], -1);
                break;
            case "F":
                updateRotation(2, [1], -1);
                break;
            case "F'":
                updateRotation(2, [1], 1);
                break;
            case "S":
                updateRotation(2, [0], -1);
                break;
            case "S'":
                updateRotation(2, [0], 1);
                break;
            case "B":
                updateRotation(2, [-1], 1);
                break;
            case "B'":
                updateRotation(2, [-1], -1);
                break;
            case "r":
                updateRotation(0, [0, 1], -1);
                break;
            case "r'":
                updateRotation(0, [0, 1], 1);
                break;
            case "l":
                updateRotation(0, [-1, 0], 1);
                break;
            case "l'":
                updateRotation(0, [-1, 0], -1);
                break;
            case "u":
                updateRotation(1, [0, 1], -1);
                break;
            case "u'":
                updateRotation(1, [0, 1], 1);
                break;
            case "d":
                updateRotation(1, [-1, 0], 1);
                break;
            case "d'":
                updateRotation(1, [-1, 0], -1);
                break;
            case "f":
                updateRotation(2, [1, 0], -1);
                break;
            case "f'":
                updateRotation(2, [1, 0], 1);
                break; 
            case "b":
                updateRotation(2, [-1, 0], 1);
                break;
            case "b'":
                updateRotation(2, [-1, 0], -1);
                break;    
            case "x":
                updateRotation(0, [-1, 0, 1], -1);
                break;
            case "x'":
                updateRotation(0, [-1, 0, 1], 1);
                break;
            case "y":
                updateRotation(1, [-1, 0, 1], -1);
                break;
            case "y'":
                updateRotation(1, [-1, 0, 1], 1);
                break;
            case "z":
                updateRotation(2, [-1, 0, 1], -1);
                break;
            case "z'":
                updateRotation(2, [-1, 0, 1], 1);
                break;
            default:
                return;
        }
        this.initializeMove();
    }

    static createRotationMatrix(component, c, s) {
        let rotationMatrix = null;
        if (component === 0) {
            rotationMatrix = mat3.fromValues(1, 0, 0, 0, c, s, 0, -s, c);
        } else if (component === 1) {
            rotationMatrix = mat3.fromValues(c, 0, -s, 0, 1, 0, s, 0, c);
        } else if (component === 2) {
            rotationMatrix = mat3.fromValues(c, s, 0, -s, c, 0, 0, 0, 1);
        }
        return rotationMatrix;
    }

    static applyRotation(mat, vec) {
        return vec3.fromValues(
            mat[0] * vec[0] + mat[3] * vec[1] + mat[6] * vec[2],
            mat[1] * vec[0] + mat[4] * vec[1] + mat[7] * vec[2],
            mat[2] * vec[0] + mat[5] * vec[1] + mat[8] * vec[2]
        );
    }

    static applySequenceWithoutAnimation(sequence) {
        // Update pieces[p].position.
        for (var sequenceIndex in sequence) {
            this.updateNextMove(sequence[sequenceIndex]);
            let cos = 0; // Math.cos(90 * Math.PI / 180);
            let sin = 1 * this.currentRotation.direction; // Math.sin(90 * Math.PI / 180);
            const rotationMatrix = this.createRotationMatrix(this.currentRotation.component, cos, sin);
            for (var i = 0; i < this.piecesInRotation.length; i++) {
                let p = this.piecesInRotation[i];
                Model.pieces[p].position = this.applyRotation(rotationMatrix, Model.pieces[p].position);
                let nSquares = Model.pieces[p].squares.length;
                for (var s = 0; s < nSquares; s++) {  // number of squares per corner/edge/center
                    for (var v = 0; v < 4; v++) {  // 4 vertices per square
                        Model.pieces[p].squares[s][v] = this.applyRotation(rotationMatrix, Model.pieces[p].squares[s][v]);
                        for (var c = 0; c < 3; c++) {  // 3 components per vertex
                            Renderer.positionBufferData[p][s][v * 3 + c] = Model.pieces[p].squares[s][v][c];
                        }
                    }
                }
            }
        }
    }

    static initializeMove() {
        this.currentRotationAngle = 0.0;
        this.piecesInRotation = [];
        
        // Define pieces to be rotated during animation
        for (var p = 0; p < Model.pieces.length; p++) {
            if (this.currentRotation.layers.includes(Model.pieces[p].position[this.currentRotation.component])) {
                this.piecesInRotation.push(p);
            }
        }
    }
    
    static applyMove() {
        // Only update positionBufferData.
        let cos = Math.cos(this.currentRotationAngle * this.currentRotation.direction);
        let sin = Math.sin(this.currentRotationAngle * this.currentRotation.direction);
        let temp = vec3.create();
        const rotationMatrix = this.createRotationMatrix(this.currentRotation.component, cos, sin);
    
        for (var i = 0; i < this.piecesInRotation.length; i++) {
            let p = this.piecesInRotation[i];
            let nSquares = Model.pieces[p].squares.length;
            for (var s = 0; s < nSquares; s++) {  // number of squares per corner/edge/center
                for (var v = 0; v < 4; v++) {  // 4 vertices per square
                    temp = this.applyRotation(rotationMatrix, Model.pieces[p].squares[s][v]);
                    for (var c = 0; c < 3; c++) {  // 3 components per vertex
                        Renderer.positionBufferData[p][s][v * 3 + c] = temp[c];
                    }
                }
            }
        }
    }
    
    static endMove() {
        // Update pieces[p].position and positionBufferData.
        let cos = 0; // Math.cos(90 * Math.PI / 180);
        let sin = 1 * this.currentRotation.direction; // Math.sin(90 * Math.PI / 180);
        const rotationMatrix = this.createRotationMatrix(this.currentRotation.component, cos, sin);
    
        for (var i = 0; i < this.piecesInRotation.length; i++) {
            let p = this.piecesInRotation[i];
            Model.pieces[p].position = this.applyRotation(rotationMatrix, Model.pieces[p].position);
            let nSquares = Model.pieces[p].squares.length;
            for (var s = 0; s < nSquares; s++) {  // number of squares per corner/edge/center
                for (var v = 0; v < 4; v++) {  // 4 vertices per square
                    Model.pieces[p].squares[s][v] = this.applyRotation(rotationMatrix, Model.pieces[p].squares[s][v]);
                    for (var c = 0; c < 3; c++) {  // 3 components per vertex
                        Renderer.positionBufferData[p][s][v * 3 + c] = Model.pieces[p].squares[s][v][c];
                    }
                }
            }
        }
        
        this.busy = false;
    }

    static resetCube() {
        Model.init();
        Renderer.populatePositionBufferData();
        this.nextMoves = [];
        this.busy = false;
    }
}
