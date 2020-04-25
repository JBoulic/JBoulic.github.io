// Defines the positions of all elements in the scene
// The positions are updated in the Animation class
// The Scene renders the model
class Model {
    static spacing = 0.05;
    static pieces = [];

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
            multiplier: 1,
            component: 1,
            color: this.COLORS.white,
        },
        D: {
            multiplier: -1,
            component: 1,
            color: this.COLORS.yellow,
        },
        R: {
            multiplier: 1,
            component: 0,
            color: this.COLORS.red,
        },
        L: {
            multiplier: -1,
            component: 0,
            color: this.COLORS.orange,
        },
        F: {
            multiplier: 1,
            component: 2,
            color: this.COLORS.green,
        },
        B: {
            multiplier: -1,
            component: 2,
            color: this.COLORS.blue,
        },
    };

    static createCorner(faces) {
        let squares = [];
        let colors = [];
        let position = vec3.create();
    
        for (var i = 0; i < 3; i++) {
            let vertices = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
            for (var j = 0; j < 4; j++) {
                vertices[j][faces[i].component] = 1.5 * faces[i].multiplier;
                vertices[j][faces[(i + 1) % 3].component] = this.CORNER_SQUARE_PATTERN[j][0] * faces[(i + 1) % 3].multiplier;
                vertices[j][faces[(i + 2) % 3].component] = this.CORNER_SQUARE_PATTERN[j][1] * faces[(i + 2) % 3].multiplier;
            }
            squares.push(vertices);
            colors.push(faces[i].color);
    
            position[faces[i].component] = faces[i].multiplier;
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
                vertices[j][faces[i].component] = 1.5 * faces[i].multiplier;
                vertices[j][faces[(i + 1) % 2].component] = this.EDGE_SQUARE_PATTERN[j][0] * faces[(i + 1) % 2].multiplier;
                vertices[j][3 - faces[0].component - faces[1].component] = this.EDGE_SQUARE_PATTERN[j][1];  // The 3 components always add up to 0 + 1 + 2 = 3
            }
            squares.push(vertices);
            colors.push(faces[i].color);
    
            position[faces[i].component] = faces[i].multiplier;
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
            vertices[j][face.component] = 1.5 * face.multiplier;
            vertices[j][(face.component + 1) % 3] = this.CENTER_SQUARE_PATTERN[j][0];
            vertices[j][(face.component + 2) % 3] = this.CENTER_SQUARE_PATTERN[j][1];  // The 3 components always add up to 0 + 1 + 2 = 3
        }
        squares.push(vertices);
        colors.push(face.color);
    
        position[face.component] = face.multiplier;
    
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
    };

    static updateCornerSticker(sticker, value) {
        // This is dependant on the order the pieces have been intialized.
        const position = this.CORNER_NAME_TO_POSITION[sticker];
        Renderer.opaqueBufferData[position[0]][position[1]] = new Float32Array([value, value, value, value]);
    }
}
