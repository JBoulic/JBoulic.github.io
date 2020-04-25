// Defines the positions of all elements in the scene
// This data is calculated here and then used for rendering in scene.js

// Positions

const spacing = 0.05;
let pieces = [];

const CORNER_SQUARE_PATTERN = [
    [0.5 + spacing, 0.5 + spacing],
    [0.5 + spacing, 1.5 - spacing],
    [1.5 - spacing, 0.5 + spacing],
    [1.5 - spacing, 1.5 - spacing],
];

const EDGE_SQUARE_PATTERN = [
    [0.5 + spacing, -0.5 + spacing],
    [0.5 + spacing, 0.5 - spacing],
    [1.5 - spacing, -0.5 + spacing],
    [1.5 - spacing, 0.5 - spacing],
];

const CENTER_SQUARE_PATTERN = [
    [-0.5 + spacing, -0.5 + spacing],
    [-0.5 + spacing, 0.5 - spacing],
    [0.5 - spacing, -0.5 + spacing],
    [0.5 - spacing, 0.5 - spacing],
];

const COLORS = {
    white: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    yellow: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    red: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    orange: [1, 0.5, 0, 1, 1, 0.5, 0, 1, 1, 0.5, 0, 1, 1, 0.5, 0, 1],
    green: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    blue:  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
}

const TEXTURE_COORDINATES = new Float32Array([
    0, 0,
    0, 1,
    1, 0,
    1, 1,
])

const FACES = {
    U: {
        multiplier: 1,
        component: 1,
        color: COLORS.white,
    },
    D: {
        multiplier: -1,
        component: 1,
        color: COLORS.yellow,
    },
    R: {
        multiplier: 1,
        component: 0,
        color: COLORS.red,
    },
    L: {
        multiplier: -1,
        component: 0,
        color: COLORS.orange,
    },
    F: {
        multiplier: 1,
        component: 2,
        color: COLORS.green,
    },
    B: {
        multiplier: -1,
        component: 2,
        color: COLORS.blue,
    },
};

const CORNER_NAME_TO_POSITION = {
    "C": [0, 0],
    "J": [0, 1],
    "M": [0, 2],
    "B": [1, 0],
    "Q": [1, 1],
    "N": [1, 2],
};

function initPieces() {
    pieces = [
        createCorner([FACES.U, FACES.F, FACES.R]),
        createCorner([FACES.U, FACES.B, FACES.R]),
        createCorner([FACES.U, FACES.B, FACES.L]),
        createCorner([FACES.U, FACES.F, FACES.L]),
        createCorner([FACES.D, FACES.F, FACES.R]),
        createCorner([FACES.D, FACES.B, FACES.R]),
        createCorner([FACES.D, FACES.B, FACES.L]),
        createCorner([FACES.D, FACES.F, FACES.L]),
        createEdge([FACES.U, FACES.F]),
        createEdge([FACES.U, FACES.R]),
        createEdge([FACES.U, FACES.B]),
        createEdge([FACES.U, FACES.L]),
        createEdge([FACES.F, FACES.R]),
        createEdge([FACES.B, FACES.R]),
        createEdge([FACES.B, FACES.L]),
        createEdge([FACES.F, FACES.L]),
        createEdge([FACES.D, FACES.F]),
        createEdge([FACES.D, FACES.R]),
        createEdge([FACES.D, FACES.B]),
        createEdge([FACES.D, FACES.L]),
        createCenter(FACES.U),
        createCenter(FACES.F),
        createCenter(FACES.R),
        createCenter(FACES.B),
        createCenter(FACES.L),
        createCenter(FACES.D),
    ];
}

function createCorner(faces) {
    let squares = [];
    let colors = [];
    let position = vec3.create();
    let opaque = [];

    for (i = 0; i < 3; i++) {
        vertices = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
        for (j = 0; j < 4; j++) {
            vertices[j][faces[i].component] = 1.5 * faces[i].multiplier;
            vertices[j][faces[(i + 1) % 3].component] = CORNER_SQUARE_PATTERN[j][0] * faces[(i + 1) % 3].multiplier;
            vertices[j][faces[(i + 2) % 3].component] = CORNER_SQUARE_PATTERN[j][1] * faces[(i + 2) % 3].multiplier;
        }
        squares.push(vertices);
        colors.push(faces[i].color);
        opaque.push(0.0);

        position[faces[i].component] = faces[i].multiplier;
    }

    return {
        squares: squares,
        colors: colors,
        position: position,
        opaque: opaque,
    };
}

function createEdge(faces) {
    let squares = [];
    let colors = [];
    let position = vec3.create();
    let opaque = [];

    for (i = 0; i < 2; i++) {
        vertices = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
        for (j = 0; j < 4; j++) {
            vertices[j][faces[i].component] = 1.5 * faces[i].multiplier;
            vertices[j][faces[(i + 1) % 2].component] = EDGE_SQUARE_PATTERN[j][0] * faces[(i + 1) % 2].multiplier;
            vertices[j][3 - faces[0].component - faces[1].component] = EDGE_SQUARE_PATTERN[j][1];  // The 3 components always add up to 0 + 1 + 2 = 3
        }
        squares.push(vertices);
        colors.push(faces[i].color);
        opaque.push(0.0);

        position[faces[i].component] = faces[i].multiplier;
    }

    return {
        squares: squares,
        colors: colors,
        position: position,
        opaque: opaque,
    };
}

function createCenter(face) {
    let squares = [];
    let colors = [];
    let position = vec3.create();
    let opaque = [];

    vertices = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
    for (j = 0; j < 4; j++) {
        vertices[j][face.component] = 1.5 * face.multiplier;
        vertices[j][(face.component + 1) % 3] = CENTER_SQUARE_PATTERN[j][0];
        vertices[j][(face.component + 2) % 3] = CENTER_SQUARE_PATTERN[j][1];  // The 3 components always add up to 0 + 1 + 2 = 3
    }
    squares.push(vertices);
    colors.push(face.color);
    opaque.push(0.0);

    position[face.component] = face.multiplier;

    return {
        squares: squares,
        colors: colors,
        position: position,
        opaque: opaque,
    };
}

function updateCornerSticker(name, value) {
    const position = CORNER_NAME_TO_POSITION[name];
    opaqueBufferData[position[0]][position[1]] = new Float32Array([value, value, value, value]);
}

function applyRotation(mat, vec) {
    return vec3.fromValues(
        mat[0] * vec[0] + mat[3] * vec[1] + mat[6] * vec[2],
        mat[1] * vec[0] + mat[4] * vec[1] + mat[7] * vec[2],
        mat[2] * vec[0] + mat[5] * vec[1] + mat[8] * vec[2]
    );
}
