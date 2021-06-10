// This class handles the animation of the cube
export class Animation {
  constructor(model, renderer) {
    this.model_ = model;
    this.renderer_ = renderer;

    this.animationSpeed = 5;

    // Moves
    this.currentRotation_ = {
      component: 0,  // 0, 1, 2 -> x, y, z.
      layers: [],  // layers to rotate, 0 being the inner layer and -1, 1 the outer ones.
      direction: 0,   // 1 is clockwise, -1 is anti-clockwise.
    };
    this.currentRotationAngle_ = 0.0;
    this.piecesInRotation_ = [];
    this.nextMoves_ = [];
    this.busy = false;
  }

  addMove(move) {
    this.nextMoves_.push(move);
  }

  updateState(deltaTime) {
    // Initialize or end move if needed.
    if (!this.busy && this.nextMoves_.length !== 0) {
      this.updateNextMove_(this.nextMoves_.shift());  // Retrieve next move from the nextMoves FIFO and update next move.
      this.busy = true;
    }
    if (this.busy && this.currentRotationAngle_ + this.animationSpeed * deltaTime > Math.PI / 2) {
      this.endMove_();
    }

    // Apply rotation if busy.
    if (this.busy) {
      this.currentRotationAngle_ += this.animationSpeed * deltaTime;
      this.applyMove_();
    }
  }

  updateNextMove_(move) {
    const updateRotation = (component, layers, direction) => {
      this.currentRotation_.component = component;
      this.currentRotation_.layers = layers;
      this.currentRotation_.direction = direction;
    }

    switch (move) {
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
    this.initializeMove_();
  }

  createRotationMatrix_(component, c, s) {
    let rotationMatrix = null;
    if (component === 0) {
      rotationMatrix = new Float32Array([1, 0, 0, 0, c, s, 0, -s, c]);
    } else if (component === 1) {
      rotationMatrix = new Float32Array([c, 0, -s, 0, 1, 0, s, 0, c]);
    } else if (component === 2) {
      rotationMatrix = new Float32Array([c, s, 0, -s, c, 0, 0, 0, 1]);
    }
    return rotationMatrix;
  }

  applyRotation_(mat, vec) {
    return new Float32Array([
      mat[0] * vec[0] + mat[3] * vec[1] + mat[6] * vec[2],
      mat[1] * vec[0] + mat[4] * vec[1] + mat[7] * vec[2],
      mat[2] * vec[0] + mat[5] * vec[1] + mat[8] * vec[2]
    ]);
  }

  applySequenceWithoutAnimation(sequence) {
    // Update pieces[p].position.
    for (var sequenceIndex in sequence) {
      this.updateNextMove_(sequence[sequenceIndex]);
      let cos = 0; // Math.cos(90 * Math.PI / 180);
      let sin = 1 * this.currentRotation_.direction; // Math.sin(90 * Math.PI / 180);
      const rotationMatrix = this.createRotationMatrix_(this.currentRotation_.component, cos, sin);
      for (var i = 0; i < this.piecesInRotation_.length; i++) {
        let p = this.piecesInRotation_[i];
        this.model_.pieces[p].position = this.applyRotation_(rotationMatrix, this.model_.pieces[p].position);
        let nSquares = this.model_.pieces[p].squares.length;
        for (var s = 0; s < nSquares; s++) {  // number of squares per corner/edge/center
          for (var v = 0; v < 4; v++) {  // 4 vertices per square
            this.model_.pieces[p].squares[s][v] = this.applyRotation_(rotationMatrix, this.model_.pieces[p].squares[s][v]);
            for (var c = 0; c < 3; c++) {  // 3 components per vertex
              this.renderer_.positionBufferData[p][s][v * 3 + c] = this.model_.pieces[p].squares[s][v][c];
            }
          }
        }
      }
    }
  }

  initializeMove_() {
    this.currentRotationAngle_ = 0.0;
    this.piecesInRotation_ = [];

    // Define pieces to be rotated during animation
    for (var p = 0; p < this.model_.pieces.length; p++) {
      if (this.currentRotation_.layers.includes(this.model_.pieces[p].position[this.currentRotation_.component])) {
        this.piecesInRotation_.push(p);
      }
    }
  }

  applyMove_() {
    // Only update positionBufferData.
    let cos = Math.cos(this.currentRotationAngle_ * this.currentRotation_.direction);
    let sin = Math.sin(this.currentRotationAngle_ * this.currentRotation_.direction);
    let temp = new Float32Array(3);
    const rotationMatrix = this.createRotationMatrix_(this.currentRotation_.component, cos, sin);

    for (var i = 0; i < this.piecesInRotation_.length; i++) {
      let p = this.piecesInRotation_[i];
      let nSquares = this.model_.pieces[p].squares.length;
      for (var s = 0; s < nSquares; s++) {  // number of squares per corner/edge/center
        for (var v = 0; v < 4; v++) {  // 4 vertices per square
          temp = this.applyRotation_(rotationMatrix, this.model_.pieces[p].squares[s][v]);
          for (var c = 0; c < 3; c++) {  // 3 components per vertex
            this.renderer_.positionBufferData[p][s][v * 3 + c] = temp[c];
          }
        }
      }
    }
  }

  endMove_() {
    // Update pieces[p].position and positionBufferData.
    let cos = 0; // Math.cos(90 * Math.PI / 180);
    let sin = 1 * this.currentRotation_.direction; // Math.sin(90 * Math.PI / 180);
    const rotationMatrix = this.createRotationMatrix_(this.currentRotation_.component, cos, sin);

    for (var i = 0; i < this.piecesInRotation_.length; i++) {
      let p = this.piecesInRotation_[i];
      this.model_.pieces[p].position = this.applyRotation_(rotationMatrix, this.model_.pieces[p].position);
      let nSquares = this.model_.pieces[p].squares.length;
      for (var s = 0; s < nSquares; s++) {  // number of squares per corner/edge/center
        for (var v = 0; v < 4; v++) {  // 4 vertices per square
          this.model_.pieces[p].squares[s][v] = this.applyRotation_(rotationMatrix, this.model_.pieces[p].squares[s][v]);
          for (var c = 0; c < 3; c++) {  // 3 components per vertex
            this.renderer_.positionBufferData[p][s][v * 3 + c] = this.model_.pieces[p].squares[s][v][c];
          }
        }
      }
    }

    this.busy = false;
  }

  resetCube() {
    this.model_.init();
    this.renderer_.populatePositionBufferData();
    this.nextMoves_ = [];
    this.busy = false;
  }
}
