import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0],
            [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
            [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],
            [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(
            0, 1, 2,
            1, 3, 2,
            4, 5, 6,
            5, 7, 6,
            8, 9, 10,
            9, 11, 10,
            12, 13, 14,
            13, 15, 14,
            16, 17, 18,
            17, 19, 18,
            20, 21, 22,
            21, 23, 22);
    }
}

class Cube_Outline extends Shape {
    constructor(color) {
        super("position", "color");
        //  TODO (Requirement 5).
        this.arrays.position = Vector3.cast(
            [-1,-1,-1], [1,-1,-1],
            [ 1,-1,-1], [ 1, 1,-1],
            [ 1, 1,-1], [-1, 1,-1],
            [-1, 1,-1], [-1,-1,-1],
            [-1,-1, 1], [ 1,-1, 1],
            [ 1,-1, 1], [ 1, 1, 1],
            [ 1, 1, 1], [-1, 1, 1],
            [-1, 1, 1], [-1,-1, 1],
            [ 1, 1, 1], [ 1, 1,-1],
            [ 1,-1, 1], [ 1,-1,-1],
            [-1, 1, 1], [-1, 1,-1],
            [-1,-1, 1], [-1,-1,-1]
        );
        // let red = color(1,0,0,1);
        this.arrays.color = [];
        for(let i=0;i<24;i++){
            this.arrays.color.push(color);
        }
        // this.arrays.color = [
        //     color(1,0,0,1), color(1,0,0,1),
        //     color(1,0,0,1), color(1,0,0,1),
        //     color(1,0,0,1), color(1,0,0,1),
        //     color(1,0,0,1), color(1,0,0,1),
        //     color(1,0,0,1), color(1,0,0,1),
        //     color(1,0,0,1), color(1,0,0,1),
        //     color(1,0,0,1), color(1,0,0,1),
        //     color(1,0,0,1), color(1,0,0,1),
        //     color(1,0,0,1), color(1,0,0,1),
        //     color(1,0,0,1), color(1,0,0,1),
        //     color(1,0,0,1), color(1,0,0,1),
        //     color(1,0,0,1), color(1,0,0,1),
        // ];
        this.indices = false;
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
    }
}

class Cube_Single_Strip extends Shape {
    constructor() {
        super("position", "normal");
        // TODO (Requirement 6)
        this.arrays.position = Vector3.cast(
            [1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1]);
        this.arrays.normal = this.arrays.position;
        // Arrange the vertices into a square shape in texture space too:
        this.indices = [0,1,2,3,6,7,3,5,1,4,0,2,4,6,5,7];
    }
}

export class Tetris extends Scene {
    /**®
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */
    constructor() {
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'cube': new Cube(),
            'outline': new Cube_Outline(color(1,1,1,1)),
            'endline': new Cube_Outline(color(1,0,0,1)),
            'strip': new Cube_Single_Strip(),
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
    }

    draw_box(context, program_state, model_transform, color) {
        // TODO:  Helper function for requirement 3 (see hint).
        //        This should make changes to the model_transform matrix, draw the next box, and return the newest model_transform.
        // Hint:  You can add more parameters for this function, like the desired color, index of the box, etc.
        const t = program_state.animation_time/1000;
        let angle = 0.05*Math.PI;
        let rotation = 0;
        if(!this.sflag)
            rotation = -1 * (angle/2 + angle/2*Math.sin(2*Math.PI*t));
        else
            rotation = -1 * angle;

        if(!this.oflag) {
            if (!this.tflag)
                this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color: color}));
            else
                this.shapes.strip.draw(context, program_state, model_transform, this.materials.plastic.override({color: color}), "TRIANGLE_STRIP");
        }
        else
            this.shapes.outline.draw(context, program_state, model_transform, this.white, "LINES");

        this.tflag = !this.tflag;

        model_transform = model_transform
            .times(Mat4.scale(1,2/3,1))
            .times(Mat4.translation(0,3,0)) //translation
            .times(Mat4.translation(1,-1.5,0))
            .times(Mat4.rotation(rotation, 0,0,1))
            .times(Mat4.translation(-1,1.5,0))
            .times(Mat4.scale(1,1.5,1));
        return model_transform;
    }

    draw_frame(context, program_state){
        let frame = Mat4.identity();
        for(let j = 0; j <= 17; j++){
            // if(j === 0){
            for(let i = -1; i <= 10; i++){
                this.shapes.outline.draw(context, program_state, frame.times(Mat4.translation(2*i,2*j,0)), this.white, "LINES");
                // this.shapes.cube.draw(context, program_state, frame.times(Mat4.translation(2*i,0,0)), this.materials.plastic.override({diffusivity:0}));
            }
            if(j === 15){
                for(let i = -1; i <= 10; i++) {
                    this.shapes.endline.draw(context, program_state,
                        frame.times(Mat4.translation(2*i, 29, 0)).times(Mat4.scale(1,0.01,1))
                        , this.white, "LINES");
                }
            }
        }

        let base = Mat4.identity().times(Mat4.translation(0,-1,0)).times(Mat4.scale(0.5,0.01,0.5)); // the flattened base
        for(let z = -10; z <= 11; z++){
            for(let x = -4; x <= 23; x++){
                this.shapes.outline.draw(context, program_state, base.times(Mat4.translation(2*x-1,0,2*z-1)), this.white, "LINES");
                // this.shapes.cube.draw(context, program_state, base.times(Mat4.translation(2*x,0,2*z)), this.materials.plastic.override({diffusivity:0}));
            }
        }

    }

    make_control_panel() {
        this.key_triggered_button("Default View", ["v"], () => this.attached = () => "origin");
        this.key_triggered_button("Rotate", ["i"], () => this.attached = () => "origin");
        this.new_line();
        this.key_triggered_button("left", ["j"], () => this.attached = () => "origin");
        this.key_triggered_button("right", ["l"], () => this.attached = () => "origin");
        this.key_triggered_button("down", ["k"], () => this.attached = () => "origin");
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, -15, -50));
        }

        if(this.attached !== undefined) {
            let desired = this.attached();
            if(desired === "origin"){
                desired = Mat4.translation(0, -15, -50);
            }
            desired = desired.map((x,i) => Vector.from( program_state.camera_inverse[i]).mix(x, 0.1));
            program_state.set_camera(desired);
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
        this.draw_frame(context, program_state);
        // TODO:  Draw your entire scene here.  Use this.draw_box( graphics_state, model_transform ) to call your helper.
    }
}