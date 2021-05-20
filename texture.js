import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Jshape extends Shape{
    constructor() {
        super("position", "normal");
        this.arrays.position = Vector3.cast(
          [-3, 3, -1], [-3, 3, 1],
          [-3, -1, -1], [-3, -1, 1],
          [3, -1, -1], [3, -1, 1],
          [3, 1, -1], [3, 1, 1],
          [-1, 1, -1], [-1, 1, 1],
          [-1, 3, -1], [-1, 3, 1]
        );
        this.arrays.normal = this.arrays.position;
//         this.indices = [0, 1, 3, 13, 11, 12, 10, 0, 2, 3, 5, 7, 6, 8, 4, 2, 5, 4, 6, 5, 7, 3, 9, 8, 7, 6, 4, 2, 8, 3, 2, 1, 0, 13, 12];
        // this.indices = [0, 1, 3, 11, 9, 8, 6, 4, 7, 5, 3, 4, 2, 6, 8, 7, 9, 3, 11, 1, 10, 0, 2, 3, 4, 2, 6, 8];
        this.indices = [0, 1, 3, 0, 3, 2, 1, 3, 11, 3, 11, 9, 3, 9, 7, 3, 7, 5,
                        0, 10, 2, 10, 2, 8, 2, 8, 6, 2, 6, 4,
                        1, 0, 10, 10, 1, 11, 10, 11, 8, 11, 8, 9, 9, 8, 6, 9, 6, 7, 6, 7, 4, 7, 4, 5, 5, 4, 3, 2, 3, 4, 4, 3, 2];
        this.rot_time = 0;
    }
    rotate() {
        this.rot_time += 1;
    }
    get_rot(){
        return this.rot_time;
    }
}

export class Lout extends Shape{
    constructor(){
        super("position", "color");
        this.arrays.position = Vector3.cast(
            [-3, 3, -1], [-3, 3, 1],
            [-3, 3, -1], [-1, 3, -1],
            [-3, 3, -1], [-3, -1, -1],
            [-3, -1, 1], [-3, 3, 1],
            [-3, -1, 1], [-3, -1, -1],
            [-3, -1, 1], [3, -1, 1],
            [-1, 3, 1], [-3, 3, 1]
            [-1, 3, 1], [-1, 3, -1],
            [-1, 3, 1], [-1, 1, 1],
            [-1, 1, -1], [-1, 3, -1],
            [-1, 1, -1], [-1, 1, 1],
            [-1, 1, -1], [3, 1, -1],
            [3, 1, 1], [-1, 1, 1],
            [3, 1, 1], [3, 1, -1],
            [3, 1, 1], [3, -1, 1],
            [3, -1, -1], [3, -1, 1],
            [3, -1, -1], [3, 1, -1],
            [3, -1, -1], [-3, -1, -1],
        );
        this.arrays.color = [
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
            color(1, 1, 1, 1), color(1, 1, 1, 1),
        ];
        this.indices = false;
    }
}

export class Lshape extends Shape{
    constructor() {
        super("position", "normal");
        this.arrays.position = Vector3.cast(
          [-3, 1, -1], [-3, 1, 1],
          [-3, -1, -1], [-3, -1, 1],
          [3, -1, -1], [3, -1, 1],
          [3, 3, -1], [3, 3, 1],
          [1, 3, -1], [1, 3, 1],
          [1, 1, -1], [1, 1, 1]
        );
        this.arrays.normal = this.arrays.position;
//         this.indices = [0, 1, 3, 13, 11, 12, 10, 0, 2, 3, 5, 7, 6, 8, 4, 2, 5, 4, 6, 5, 7, 3, 9, 8, 7, 6, 4, 2, 8, 3, 2, 1, 0, 13, 12];
        // this.indices = [0, 1, 3, 11, 9, 8, 6, 4, 7, 5, 3, 4, 2, 6, 8, 7, 9, 3, 11, 1, 10, 0, 2, 3, 4, 2, 6, 8];
        this.indices = [0, 1, 2, 1, 2, 3, 2, 3, 5, 3, 5, 4, 5, 4, 7, 4, 6, 7, 6, 7, 9, 9, 8, 6, 9, 8, 10, 9, 10, 11, 11, 10, 0, 0, 1, 11,
                        1, 3, 5, 1, 5, 11, 11, 5, 9, 9, 5, 7,
                        2, 4, 0, 4, 0, 10, 10, 4, 8, 8, 4, 6, 6, 4, 5, 5, 4, 2];
        this.rot_time = 0;
    }
    rotate() {
        this.rot_time += 1;
    }
    get_rot(){
        return this.rot_time;
    }
}

export class Ishape extends Shape{
    constructor() {
        super("position", "normal");
        this.arrays.position = Vector3.cast(
            [4, 2, 1], [4, 0, 1],
            [-4, 0, 1], [-4, 2, 1],
            [-4, 2, -1], [-4, 0, -1],
            [4, 0, -1], [4, 2, -1]
        );
        this.arrays.normal = this.arrays.position;
        this.indices = [0, 1, 2, 1, 2, 5, 2, 5, 3, 5, 3, 4, 3, 4, 0, 4, 0, 7, 0, 7, 6, 
                        7, 6, 4, 6, 4, 5, 4, 5, 3, 5, 3, 2, 3, 2, 0, 2, 0, 1, 0, 1, 6, 1, 6, 5];
        this.rot_time = 0;
    }
    rotate() {
        this.rot_time += 1;
    }
    get_rot(){
        return this.rot_time;
    }
}

export class squareShape extends Shape {
    constructor() {
        super("position", "normal");
        this.arrays.position = Vector3.cast(
            [2, 2, 1], [2, -2, 1],
            [-2, -2, 1], [-2, 2, 1],
            [-2, 2, -1], [-2, -2, -1],
            [2, -2, -1], [2, 2, -1], 
        );
        this.arrays.normal = this.arrays.position;
        this.indices = [0, 1, 2, 1, 2, 5, 2, 5, 3, 5, 3, 4, 3, 4, 0, 4, 0, 7, 0, 7, 6, 
                        7, 6, 4, 6, 4, 5, 4, 5, 3, 5, 3, 2, 3, 2, 0, 2, 0, 1, 0, 1, 6, 1, 6, 5];
        this.rot_time = 0;
    }
    rotate() {
        this.rot_time += 1;
    }
    get_rot(){
        return this.rot_time;
    }
}

export class Tshape extends Shape {
    constructor() {
        super("position", "normal");
        this.arrays.position = Vector3.cast(
            [1, 3, 1], [1, 1, 1],
            [3, 1, 1], [3, -1, 1],
            [-3, -1, 1], [-3, 1, 1],
            [-1, 1, 1], [-1, 3, 1],
            [-1, 3, -1], [1, 3, -1],
            [1, 1, -1], [3, 1, -1],
            [3, -1, -1], [-3, -1, -1],
            [-3, 1, -1], [-1, 1, -1]
        );
        this.arrays.normal = this.arrays.position;
        this.indices = [5, 4, 2, 4, 2, 3, 3, 4, 13, 13, 3, 12, 13, 12, 14, 14, 12, 11, 11, 14, 2, 2, 14, 5,
                        4, 5, 13, 13, 5, 14, 14, 11, 2, 2, 11, 12, 12, 2, 3,
                        2, 3, 11, 11, 2, 10, 10, 2, 1, 1, 10, 0, 0, 10, 9, 9, 0, 7, 7, 9, 8, 8, 7, 15, 15, 7, 6, 6, 7, 1, 1, 7, 0, 0, 7, 9, 9 ,7 ,8, 8, 9, 10, 10, 8, 15];
        this.rot_time = 0;
    }
    rotate() {
        this.rot_time += 1;
    }
    get_rot(){
        return this.rot_time;
    }
}

export class Sshape extends Shape {
    constructor() {
        super("position", "normal");
        this.arrays.position = Vector3.cast(
            
        );
        this.arrays.normal = this.arrays.position;
        this.indices = [];
        this.rot_time = 0;
    }
    rotate() {
        this.rot_time += 1;
    }
    get_rot() {
        return this.rot_time;
    }
}

class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'LShape': new Lshape(),
            'Lout': new Lout(),
            "JShape": new Jshape(),
            "IShape": new Ishape(),
            "SquareShape": new squareShape(),
            "TShape": new Tshape(),
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .6, diffusivity: .6, specularity: .1, color: hex_color("#ffffff")}),
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(5, -10, -30));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 20, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}

export class Assignment2 extends Base_Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */
    constructor(){
        super();
        this.set_colors();
        this.sit = false;
        this.outline = false;
    }
    set_colors() {
        // TODO:  Create a class member variable to store your cube's colors.
        // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
        // Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.
        this.color = [];
        this.color.push(color(Math.random(), Math.random(), Math.random(), 1.0));
        let i = 1;
        for ( i = 1; i < 8; i++ ){
            let temp = color(Math.random(), Math.random(), Math.random(), 1.0);
            while ( temp[0] == this.color[i-1][0] &&  temp[1] == this.color[i-1][1] && temp[2] == this.color[i-1][2]){
                temp = color(Math.random(), Math.random(), Math.random(), 1.0);
            }
            console.log(temp)
            this.color.push(temp);
        }
    }

    make_control_panel() {
        this.key_triggered_button("Rotate Obj L", ["r Lshape"], () => {
            this.shapes.LShape.rotate();
        });
        this.key_triggered_button("Rotate Obj J", ["r Jshape"], () => {
            this.shapes.JShape.rotate();
        });
        this.key_triggered_button("Rotate Obj I", ["r Ishape"], () => {
            this.shapes.IShape.rotate();
        });
        this.key_triggered_button("Rotate Obj Square", ["r Squareshape"], () => {
            this.shapes.SquareShape.rotate();
        });
        this.key_triggered_button("Rotate Obj T", ["r Tshape"], () => {
            this.shapes.TShape.rotate();
        });
    }

     draw_L(context, program_state, model_transform, color) {
        var rot_time;
        rot_time = this.shapes.LShape.get_rot();
        rot_time = rot_time % 4;
        let displacement = rot_time * 0.5 * Math.PI;
        model_transform = model_transform.times(Mat4.rotation(displacement, 0, 0, 1));
        this.shapes.LShape.draw(context, program_state, model_transform, this.materials.plastic.override({color:color}));
//         this.shapes.Lout.draw(context, program_state, model_transform, this.white, "LINES");

     }

     draw_J(context, program_state, model_transform, color) {
        var rot_time;
        rot_time = this.shapes.JShape.get_rot();
        rot_time = rot_time % 4;
        let displacement = rot_time * 0.5 * Math.PI;
        model_transform = model_transform.times(Mat4.rotation(displacement, 0, 0, 1));
        this.shapes.JShape.draw(context, program_state, model_transform, this.materials.plastic.override({color:color}));
     }

     draw_I(context, program_state, model_transform, color) {
        var rot_time;
        rot_time = this.shapes.IShape.get_rot();
        rot_time = rot_time % 4;
        let displacement = rot_time * 0.5 * Math.PI;
        model_transform = model_transform.times(Mat4.rotation(displacement, 0, 0, 1));
        this.shapes.IShape.draw(context, program_state, model_transform, this.materials.plastic.override({color:color}));
     }

     draw_Square(context, program_state, model_transform, color) {
        var rot_time;
        rot_time = this.shapes.SquareShape.get_rot();
        rot_time = rot_time % 4;
        let displacement = rot_time * 0.5 * Math.PI;
        model_transform = model_transform.times(Mat4.rotation(displacement, 0, 0, 1));
        this.shapes.SquareShape.draw(context, program_state, model_transform, this.materials.plastic.override({color:color}));
     }

     draw_T(context, program_state, model_transform, color) {
        var rot_time;
        rot_time = this.shapes.TShape.get_rot();
        rot_time = rot_time % 4;
        let displacement = rot_time * 0.5 * Math.PI;
        model_transform = model_transform.times(Mat4.rotation(displacement, 0, 0, 1));
        this.shapes.TShape.draw(context, program_state, model_transform, this.materials.plastic.override({color:color}));
     }


    display(context, program_state) {
        super.display(context, program_state);
        let model_transform = Mat4.identity();

        // Example for drawing a cube, you can remove this line if needed
        // his.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color:blue}));
        // TODO:  Draw your entire scene here.  Use this.draw_box( graphics_state, model_transform ) to call your helper.

        // animate the cube
        let t = program_state.animation_time;
        t = t/1000;

        // let displacement = -0.025 * Math.PI - 0.025 * Math.PI * Math.sin(2*Math.PI*t);
        //     *
        // * * *  L shape
        model_transform = Mat4.translation(-5, 0, 0);
        this.draw_L(context, program_state, model_transform, hex_color("#00ff00"));

        model_transform = Mat4.translation(5, 0, 0);
        this.draw_J(context, program_state, model_transform, hex_color("#ff0000"));
        
        model_transform = Mat4.translation(-5, 10, 0);
        this.draw_I(context, program_state, model_transform, hex_color("#00ffff"));

        model_transform = Mat4.translation(5, 10, 0);
        this.draw_Square(context, program_state, model_transform, hex_color("#ffff00"));

        model_transform = Mat4.translation(-15, 0, 0);
        this.draw_T(context, program_state, model_transform, hex_color("#ff00ff"));
    }
}



// class Cube extends Shape {
//     constructor() {
//         super("position", "normal",);
//         // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
//         this.arrays.position = Vector3.cast(
//             [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
//             [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
//             [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
//         this.arrays.normal = Vector3.cast(
//             [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
//             [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
//             [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
//         // Arrange the vertices into a square shape in texture space too:
//         this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
//             14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
//     }
// }

// class Cube_Outline extends Shape {
//     constructor() {
//         super("position", "color");
//         //  TODO (Requirement 5).
//         // When a set of lines is used in graphics, you should think of the list entries as
//         // broken down into pairs; each pair of vertices will be drawn as a line segment.
//         // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
//         this.arrays.position = Vector3.cast(
//             [-1, -1, -1], [1, -1, -1],
//             [-1, -1, -1], [-1, -1, 1],
//             [-1, -1, -1], [-1, 1, -1],
//             [-1, 1, 1], [-1, -1, 1],
//             [-1, 1, 1], [1, 1, 1],
//             [-1, 1, 1], [-1, 1, -1],
//             [1, 1, -1], [-1, 1, -1],
//             [1, 1, -1], [1, 1, 1],
//             [1, 1, -1], [1, -1, -1],
//             [1, -1, 1], [-1, -1, 1],
//             [1, -1, 1], [1, 1, 1],
//             [1, -1, 1], [1, -1, -1],
//         );
//         this.arrays.color = [
//             color(1, 1, 1, 1), color(1, 1, 1, 1),
//             color(1, 1, 1, 1), color(1, 1, 1, 1),
//             color(1, 1, 1, 1), color(1, 1, 1, 1),
//             color(1, 1, 1, 1), color(1, 1, 1, 1),
//             color(1, 1, 1, 1), color(1, 1, 1, 1),
//             color(1, 1, 1, 1), color(1, 1, 1, 1),
//             color(1, 1, 1, 1), color(1, 1, 1, 1),
//             color(1, 1, 1, 1), color(1, 1, 1, 1),
//             color(1, 1, 1, 1), color(1, 1, 1, 1),
//             color(1, 1, 1, 1), color(1, 1, 1, 1),
//             color(1, 1, 1, 1), color(1, 1, 1, 1),
//             color(1, 1, 1, 1), color(1, 1, 1, 1),
//         ];
//         this.indices = false;
//     }
// }

// class Cube_Single_Strip extends Shape {
//     constructor() {
//         super("position", "normal");
//         // TODO (Requirement 6)
//         this.arrays.position = Vector3.cast(
//             [1, 1, 1],
//             [1, -1, 1],
//             [-1, -1, 1],
//             [-1, 1, 1],
//             [-1, 1, -1],
//             [-1, -1, -1],
//             [1, -1, -1],
//             [1, 1, -1],
//         );
//         this.arrays.normal = this.arrays.position;
//         this.indices = [0, 1, 2, 5, 3, 4, 0, 7, 6, 4, 5, 3, 2, 0, 1, 6, 5];
//     }
// }