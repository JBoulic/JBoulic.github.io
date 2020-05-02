// Defines the positions of all elements in the scene
// The positions are updated in the Animation class
// The Scene renders the model
class Model {
    static spacing = 0.05;
    static pieces = [];
    // {
    //     squares: squares,  --> Vertices of the square of the piece
    //     colors: colors,  --> Color of each square
    //     position: position,   --> Which layer, according to each component (ex: [0, 0, 1] for the front face)
    // }

    static CORNER_SQUARE_PATTERN = [
        [0.5 + this.spacing, 0.5 + this.spacing],
        [0.5 + this.spacing, 1.5 - this.spacing],
        [1.5 - this.spacing, 0.5 + this.spacing],
        [1.5 - this.spacing, 1.5 - this.spacing],
    ];
    
    static EDGE_SQUARE_PATTERN = [
        [0.5 + this.spacing, -0.5 + this.spacing],
        [0.5 + this.spacing, 0.5 - this.spacing],
        [1.5 - this.spacing, -0.5 + this.spacing],
        [1.5 - this.spacing, 0.5 - this.spacing],
    ];
    
    static CENTER_SQUARE_PATTERN = [
        [-0.5 + this.spacing, -0.5 + this.spacing],
        [-0.5 + this.spacing, 0.5 - this.spacing],
        [0.5 - this.spacing, -0.5 + this.spacing],
        [0.5 - this.spacing, 0.5 - this.spacing],
    ];
    
    static COLORS = {
        white: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        yellow: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
        red: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
        orange: [1, 0.5, 0, 1, 1, 0.5, 0, 1, 1, 0.5, 0, 1, 1, 0.5, 0, 1],
        green: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        blue:  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
    }
    
    static FACES = {
        U: {
            component: 1,
            layer: 1,
            color: this.COLORS.white,
        },
        D: {
            component: 1,
            layer: -1,
            color: this.COLORS.yellow,
        },
        R: {
            component: 0,
            layer: 1,
            color: this.COLORS.red,
        },
        L: {
            component: 0,
            layer: -1,
            color: this.COLORS.orange,
        },
        F: {
            component: 2,
            layer: 1,
            color: this.COLORS.green,
        },
        B: {
            component: 2,
            layer: -1,
            color: this.COLORS.blue,
        },
    };

    static createCorner(faces) {
        // Corner defined by 3 faces.
        let squares = [];
        let colors = [];
        let position = vec3.create();
    
        for (var i = 0; i < 3; i++) {
            // Coordinates of the vertices of each square.
            let vertices = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
            for (var j = 0; j < 4; j++) {
                vertices[j][faces[i].component] = 1.5 * faces[i].layer;
                vertices[j][faces[(i + 1) % 3].component] = this.CORNER_SQUARE_PATTERN[j][0] * faces[(i + 1) % 3].layer;
                vertices[j][faces[(i + 2) % 3].component] = this.CORNER_SQUARE_PATTERN[j][1] * faces[(i + 2) % 3].layer;
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

    static createEdge(faces) {
        let squares = [];
        let colors = [];
        let position = vec3.create();
    
        for (var i = 0; i < 2; i++) {
            let vertices = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
            for (var j = 0; j < 4; j++) {
                vertices[j][faces[i].component] = 1.5 * faces[i].layer;
                vertices[j][faces[(i + 1) % 2].component] = this.EDGE_SQUARE_PATTERN[j][0] * faces[(i + 1) % 2].layer;
                vertices[j][3 - faces[0].component - faces[1].component] = this.EDGE_SQUARE_PATTERN[j][1];  // The 3 components always add up to 0 + 1 + 2 = 3
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

    static createCenter(face) {
        let squares = [];
        let colors = [];
        let position = vec3.create();
    
        let vertices = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
        for (var j = 0; j < 4; j++) {
            vertices[j][face.component] = 1.5 * face.layer;
            vertices[j][(face.component + 1) % 3] = this.CENTER_SQUARE_PATTERN[j][0];
            vertices[j][(face.component + 2) % 3] = this.CENTER_SQUARE_PATTERN[j][1];  // The 3 components always add up to 0 + 1 + 2 = 3
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

    static init() {
        this.pieces = [
            this.createCorner([this.FACES.U, this.FACES.F, this.FACES.R]),
            this.createCorner([this.FACES.U, this.FACES.B, this.FACES.R]),
            this.createCorner([this.FACES.U, this.FACES.B, this.FACES.L]),
            this.createCorner([this.FACES.U, this.FACES.F, this.FACES.L]),
            this.createCorner([this.FACES.D, this.FACES.F, this.FACES.R]),
            this.createCorner([this.FACES.D, this.FACES.B, this.FACES.R]),
            this.createCorner([this.FACES.D, this.FACES.B, this.FACES.L]),
            this.createCorner([this.FACES.D, this.FACES.F, this.FACES.L]),
            this.createEdge([this.FACES.U, this.FACES.F]),
            this.createEdge([this.FACES.U, this.FACES.R]),
            this.createEdge([this.FACES.U, this.FACES.B]),
            this.createEdge([this.FACES.U, this.FACES.L]),
            this.createEdge([this.FACES.F, this.FACES.R]),
            this.createEdge([this.FACES.B, this.FACES.R]),
            this.createEdge([this.FACES.B, this.FACES.L]),
            this.createEdge([this.FACES.F, this.FACES.L]),
            this.createEdge([this.FACES.D, this.FACES.F]),
            this.createEdge([this.FACES.D, this.FACES.R]),
            this.createEdge([this.FACES.D, this.FACES.B]),
            this.createEdge([this.FACES.D, this.FACES.L]),
            this.createCenter(this.FACES.U),
            this.createCenter(this.FACES.F),
            this.createCenter(this.FACES.R),
            this.createCenter(this.FACES.B),
            this.createCenter(this.FACES.L),
            this.createCenter(this.FACES.D),
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

    static updateCornerSticker(sticker, value) {
        // This is dependant on the order the pieces have been intialized.
        const position = this.CORNER_NAME_TO_POSITION[sticker];
        Renderer.opaqueBufferData[position[0]][position[1]] = new Float32Array([value, value, value, value]);
    }

    static updateEdgeSticker(sticker, value) {
        // This is dependant on the order the pieces have been intialized.
        const position = this.EDGE_NAME_TO_POSITION[sticker];
        Renderer.opaqueBufferData[position[0]][position[1]] = new Float32Array([value, value, value, value]);
    }
}
