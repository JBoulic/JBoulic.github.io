import { PIECES_SPACING } from './constants.js';

// Defines the positions of all elements in the scene
// The positions are updated in the Animation class
// The Scene renders the model
export class Model {
  constructor() {
    this.pieces = [];
    // {
    //     squares: squares,  --> Vertices of the square of the piece
    //     colors: colors,  --> Color of each square
    //     position: position,   --> Which layer (1, 0 or -1), according to each component (ex: [0, 0, 1] for the front face)
    // }
  }

  static CORNER_SQUARE_PATTERN = [
    [0.5 + PIECES_SPACING, 0.5 + PIECES_SPACING],
    [0.5 + PIECES_SPACING, 1.5 - PIECES_SPACING],
    [1.5 - PIECES_SPACING, 0.5 + PIECES_SPACING],
    [1.5 - PIECES_SPACING, 1.5 - PIECES_SPACING],
  ];

  static EDGE_SQUARE_PATTERN = [
    [0.5 + PIECES_SPACING, -0.5 + PIECES_SPACING],
    [0.5 + PIECES_SPACING, 0.5 - PIECES_SPACING],
    [1.5 - PIECES_SPACING, -0.5 + PIECES_SPACING],
    [1.5 - PIECES_SPACING, 0.5 - PIECES_SPACING],
  ];

  static CENTER_SQUARE_PATTERN = [
    [-0.5 + PIECES_SPACING, -0.5 + PIECES_SPACING],
    [-0.5 + PIECES_SPACING, 0.5 - PIECES_SPACING],
    [0.5 - PIECES_SPACING, -0.5 + PIECES_SPACING],
    [0.5 - PIECES_SPACING, 0.5 - PIECES_SPACING],
  ];

  static COLORS = {
    white: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    yellow: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    red: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    orange: [1, 0.5, 0, 1, 1, 0.5, 0, 1, 1, 0.5, 0, 1, 1, 0.5, 0, 1],
    green: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    blue: [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
  }

  static FACES = {
    U: {
      component: 1,
      layer: 1,
      color: Model.COLORS.white,
    },
    D: {
      component: 1,
      layer: -1,
      color: Model.COLORS.yellow,
    },
    R: {
      component: 0,
      layer: 1,
      color: Model.COLORS.red,
    },
    L: {
      component: 0,
      layer: -1,
      color: Model.COLORS.orange,
    },
    F: {
      component: 2,
      layer: 1,
      color: Model.COLORS.green,
    },
    B: {
      component: 2,
      layer: -1,
      color: Model.COLORS.blue,
    },
  };

  static createCorner_(faces) {
    // Corner defined by 3 faces.
    let squares = [];
    let colors = [];
    let position = new Float32Array(3);

    for (var i = 0; i < 3; i++) {
      // Coordinates of the vertices of each square.
      let vertices = [new Float32Array(3), new Float32Array(3), new Float32Array(3), new Float32Array(3)];
      for (var j = 0; j < 4; j++) {
        vertices[j][faces[i].component] = 1.5 * faces[i].layer;
        vertices[j][faces[(i + 1) % 3].component] = Model.CORNER_SQUARE_PATTERN[j][0] * faces[(i + 1) % 3].layer;
        vertices[j][faces[(i + 2) % 3].component] = Model.CORNER_SQUARE_PATTERN[j][1] * faces[(i + 2) % 3].layer;
      }
      squares.push(vertices);
      colors.push(faces[i].color);

      position[faces[i].component] = faces[i].layer;
    }

    return {
      squares: squares,
      colors: colors,
      position: position,
    };
  }

  static createEdge_(faces) {
    let squares = [];
    let colors = [];
    let position = new Float32Array(3);

    for (var i = 0; i < 2; i++) {
      let vertices = [new Float32Array(3), new Float32Array(3), new Float32Array(3), new Float32Array(3)];
      for (var j = 0; j < 4; j++) {
        vertices[j][faces[i].component] = 1.5 * faces[i].layer;
        vertices[j][faces[(i + 1) % 2].component] = Model.EDGE_SQUARE_PATTERN[j][0] * faces[(i + 1) % 2].layer;
        vertices[j][3 - faces[0].component - faces[1].component] = Model.EDGE_SQUARE_PATTERN[j][1];  // The 3 components always add up to 0 + 1 + 2 = 3
      }
      squares.push(vertices);
      colors.push(faces[i].color);

      position[faces[i].component] = faces[i].layer;
    }

    return {
      squares: squares,
      colors: colors,
      position: position,
    };
  }

  static createCenter_(face) {
    let squares = [];
    let colors = [];
    let position = new Float32Array(3);

    let vertices = [new Float32Array(3), new Float32Array(3), new Float32Array(3), new Float32Array(3)];
    for (var j = 0; j < 4; j++) {
      vertices[j][face.component] = 1.5 * face.layer;
      vertices[j][(face.component + 1) % 3] = Model.CENTER_SQUARE_PATTERN[j][0];
      vertices[j][(face.component + 2) % 3] = Model.CENTER_SQUARE_PATTERN[j][1];  // The 3 components always add up to 0 + 1 + 2 = 3
    }
    squares.push(vertices);
    colors.push(face.color);

    position[face.component] = face.layer;

    return {
      squares: squares,
      colors: colors,
      position: position,
    };
  }

  init() {
    this.pieces = [
      Model.createCorner_([Model.FACES.U, Model.FACES.F, Model.FACES.R]),
      Model.createCorner_([Model.FACES.U, Model.FACES.B, Model.FACES.R]),
      Model.createCorner_([Model.FACES.U, Model.FACES.B, Model.FACES.L]),
      Model.createCorner_([Model.FACES.U, Model.FACES.F, Model.FACES.L]),
      Model.createCorner_([Model.FACES.D, Model.FACES.F, Model.FACES.R]),
      Model.createCorner_([Model.FACES.D, Model.FACES.B, Model.FACES.R]),
      Model.createCorner_([Model.FACES.D, Model.FACES.B, Model.FACES.L]),
      Model.createCorner_([Model.FACES.D, Model.FACES.F, Model.FACES.L]),
      Model.createEdge_([Model.FACES.U, Model.FACES.F]),
      Model.createEdge_([Model.FACES.U, Model.FACES.R]),
      Model.createEdge_([Model.FACES.U, Model.FACES.B]),
      Model.createEdge_([Model.FACES.U, Model.FACES.L]),
      Model.createEdge_([Model.FACES.F, Model.FACES.R]),
      Model.createEdge_([Model.FACES.B, Model.FACES.R]),
      Model.createEdge_([Model.FACES.B, Model.FACES.L]),
      Model.createEdge_([Model.FACES.F, Model.FACES.L]),
      Model.createEdge_([Model.FACES.D, Model.FACES.F]),
      Model.createEdge_([Model.FACES.D, Model.FACES.R]),
      Model.createEdge_([Model.FACES.D, Model.FACES.B]),
      Model.createEdge_([Model.FACES.D, Model.FACES.L]),
      Model.createCenter_(Model.FACES.U),
      Model.createCenter_(Model.FACES.F),
      Model.createCenter_(Model.FACES.R),
      Model.createCenter_(Model.FACES.B),
      Model.createCenter_(Model.FACES.L),
      Model.createCenter_(Model.FACES.D),
    ];
  }

  static CORNER_NAME_TO_POSITION = {
    "C": [0, 0],
    "J": [0, 1],
    "M": [0, 2],
    "B": [1, 0],
    "Q": [1, 1],
    "N": [1, 2],
    "A": [2, 0],
    "R": [2, 1],
    "E": [2, 2],
    "D": [3, 0],
    "I": [3, 1],
    "F": [3, 2],
    "V": [4, 0],
    "K": [4, 1],
    "P": [4, 2],
    "W": [5, 0],
    "T": [5, 1],
    "O": [5, 2],
    "X": [6, 0],
    "S": [6, 1],
    "H": [6, 2],
    "U": [7, 0],
    "L": [7, 1],
    "G": [7, 2],
  };

  static EDGE_NAME_TO_POSITION = {
    "C": [8, 0],
    "I": [8, 1],
    "B": [9, 0],
    "M": [9, 1],
    "A": [10, 0],
    "Q": [10, 1],
    "D": [11, 0],
    "E": [11, 1],
    "J": [12, 0],
    "P": [12, 1],
    "T": [13, 0],
    "N": [13, 1],
    "R": [14, 0],
    "H": [14, 1],
    "L": [15, 0],
    "F": [15, 1],
    "U": [16, 0],
    "K": [16, 1],
    "V": [17, 0],
    "O": [17, 1],
    "W": [18, 0],
    "S": [18, 1],
    "X": [19, 0],
    "G": [19, 1],
  };
}
