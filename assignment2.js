import {defs, tiny} from './examples/common.js';

let nRows = 20;
let nCols = 20;
let EMPTY = -1
let BORDER = -2
let FILLED = 99
let counter = 0.0


const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,Shader, Texture,
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
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}

class Cube_Outline extends Shape {
    constructor() {
        super("position", "color");
        //  TODO (Requirement 5).
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1],
            [-1, -1, 1], [1, -1, 1],
            [1, 1, -1], [-1, 1, -1],
            [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1],
             [-1, 1, -1], [-1, 1, 1],
              [1, -1, 1], [1, -1, -1],
              [1, 1, 1], [1, 1, -1],
              [-1,-1,1],[-1,1,1],
              [-1,-1,-1],[-1,1,-1],
              [1,-1,1],[1,1,1],
              [1,-1,-1],[1,1,-1]
            );


        let white = color(1.0,1.0,1.0,1.0)
        this.arrays.color = [];
        for(let i=0;i<24;i++){
            this.arrays.color.push(white);
        }
        this.indices = false;

    }

}

class Cube_Single_Strip extends Shape {
    constructor() {
        super("position", "normal");
        // TODO (Requirement 6)
        this.arrays.position = Vector3.cast(
              [-1,-1,1],[1,-1,1],[1,-1,-1],[-1,-1,-1],[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]
            );

        this.arrays.normal = this.arrays.position;
        this.indices = [0,1,3,2,4,7,5,6,0,1,6,2,7,4,3,5,0]

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
            'cube': new Cube(),
            'outline': new Cube_Outline(),
            'strip': new Cube_Single_Strip()
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#FF0000")}),
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        // if (!context.scratchpad.controls) {
        //     this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
        //     // Define the global camera and projection matrices, which are stored in program_state.
        //     program_state.set_camera(Mat4.translation(5, -10, -30));
        // }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
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
        this.is_still = false;
        this.is_outline = false;
        this.is_odd = true;
        this.totalobj = 0;
        // this.set_colors()
        this.shape_t =
        {
            ZShape: [[0, -1], [0, 0], [-1, 0], [-1, 1]],
            SShape: [[0, -1], [0, 0], [1, 0], [1, 1]],
            IShape: [[0, -1], [0, 0], [0, 1], [0, 2]],
            TShape: [[-1, 0], [0, 0], [1, 0], [0, 1]],
            Square: [[0, 0], [1, 0], [0, 1], [1, 1]],
            LShape: [[-1, -1], [0, -1], [0, 0], [0, 1]],
            JShape: [[1, -1], [0, -1], [0, 0], [0, 1]],
        };
        this.grid = this.initGrid();
        this.obj = [];
        this.addNext = true;

        this.cubes = {
            ZShape: [[0, -1], [0, 0], [-1, 0], [-1, 1]],
            SShape: [[0, -1], [0, 0], [1, 0], [1, 1]],
            IShape: [[0, -1], [0, 0], [0, 1], [0, 2]],
            TShape: [[-1, 0], [0, 0], [1, 0], [0, 1]],
            Square: [[0, 0], [1, 0], [0, 1], [1, 1]],
            LShape: [[-1, -1], [0, -1], [0, 0], [0, 1]],
            JShape: [[1, -1], [0, -1], [0, 0], [0, 1]]
        };
        this.shapes.square = new defs.Square();
        this.falling = {r:0,c:9,pos:this.cubes.ZShape,color_i:0}
        const shader = new defs.Fake_Bump_Map(1);
        this.textures = {
            rgb: new Texture("./assets/rgb.jpg"),
            earth: new Texture("./assets/earth.gif"),
            // grid: new Texture("assets/grid.png"),
            stars: new Texture("./assets/stars.png"),
            text: new Texture("./assets/text.png"),
        }



        this.material = new Material(shader, {
            color: hex_color('#000000'),
            ambient: 1, texture: new Texture("./assets/stars.png")
        })


    }



    random_color() {
        // random_shape():  Extract a random shape from this.shapes.
        return Math.floor(4 * Math.random());
    }

    get_color(index) {
        let color;
        if (index === 0){
            color = hex_color("#ff0000");
        } else if (index === 1 ) {
            color = hex_color("#00ff00");
        } else if ( index === 2 ) {
            color = hex_color("#0000ff");
        } else {
            color = hex_color("#fcd303");
        }
        return color;
    }



    new_T() // new object generator template (currently not in use)
    {
        let y = 1 + Math.floor((nCols - 4) * Math.random());
        let x = 1;
        let shape = this.shape_t;
        // x y will be the bottom left corner of the generated T shape
        let temp = this.random_color();
        for ( var i = 0; i < 4; i++)
        {
            this.grid[shape.Square[i][0] + x][shape.Square[i][1] + y] = temp;
        }
//         this.obj.push(Tshape);
    }


    gene_new_obj()
    {
        let num = 1 + Math.floor(7 * Math.random());
        let shape = this.shape_t;
        // let y = 1 + Math.floor((nCols - 4) * Math.random());
        // let x = 1;
        var next_shape;
        switch(num){
            case 1:
                next_shape = shape.ZShape;
                break;
            case 2:
                next_shape = shape.SShape;
                break;
            case 3:
                next_shape = shape.IShape;
                break;
            case 4:
                next_shape = shape.TShape;
                break;
            case 5:
                next_shape = shape.Square;
                break;
            case 6:
                next_shape = shape.LShape;
                break;
            case 7:
                next_shape = shape.JShape;
                break;
        }
        this.falling.pos = next_shape;
        // console.log(num);
        // let temp = this.random_color();
        // for ( var i = 0; i < 4; i++)
        // {
        //     this.grid[next_shape[i][0] + x][next_shape[i][1] + y] = 99;
        // }
    }

    initGrid() {
        function fill(arr, value) {
            for (var i = 0; i < arr.length; i++) {
                arr[i] = value;
            }
        }
        let grid = [];
        // let nRows = 10;
        // let nCols = 18;
        for (let r = -1; r < nRows; r++) {
            grid[r] = new Array(nCols);
            fill(grid[r], -1);
            for (let c = 0; c < nCols; c++) {
                if (c === 0 || c === nCols - 1)
                    grid[r][c] = -2;
            }
        }
        return grid;
    }


    make_control_panel() {
        this.key_triggered_button("Rotate", ["ArrowUp"], () => {
            if(this.canRotate())
                this.rotate(this.falling);
        });
        this.new_line();
        this.key_triggered_button("left", ["ArrowLeft"], () => {
            if(this.canMove([-1,0]))
                this.move([-1,0]);
        });
        this.key_triggered_button("right", ["ArrowRight"], () => {
            if(this.canMove([1,0]))
                this.move([1,0]);
        });
        this.key_triggered_button("down", ["ArrowDown"], () => {
            if(this.canMove([0,1]))
                this.move([0,1]);
        });
    }

    resetFallingShape(){
        this.falling.r = 0
        this.falling.c = 9
    }

    draw_cube(context, program_state){
        for (let i = 0; i < nCols; i++){
            for (let j = 0; j < nRows; j++){
                if ( this.grid[i][j] === -2 ){
                    let x = j - .5 * nRows;
                    let y = 15 - i - 1;
                    let model_transform = Mat4.translation(x*2, y*2, 0);
                    this.shapes.outline.draw(context, program_state, model_transform, this.white, "LINES");
                } else if ( this.grid[i][j] !== -1 ){
                    let x = j - .5 * nRows;
                    let y = 15 - i - 1;
                    let model_transform = Mat4.translation(x*2, y*2, 0);
                    let color = this.get_color(this.grid[i][j]);
                    this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color: color}));
                    this.shapes.outline.draw(context, program_state, model_transform, this.white, "LINES");
                }

            }
        }
    }

    canMove(dir){
        for (let arr of this.falling.pos){
            let newCol = this.falling.c + arr[0] + dir[0];
            let newRow = this.falling.r + arr[1] + dir[1];
            if (this.grid[newRow][newCol] !== EMPTY){
                return false
            }
        }
        return true;
    }

    canRotate(){
        for (let arr of this.falling.pos){
            let tempCol = arr[1];
            let tempRow = -arr[0];
            let newCol = this.falling.c + tempCol;
            let newRow = this.falling.r + tempRow;
            if(this.grid[newRow][newCol] !== EMPTY){
                return false;
            }
        }
        return true;
    }

    move(dir){
        //dir is a two element array [-1~1,-1~1] to indicate the direction
        this.falling.r += dir[1];
        this.falling.c += dir[0];
    }

    rotate(s){
        if (this.falling.pos === this.shape_t.Square)
            return;
        for (let arr of this.falling.pos){
            let temp = arr[0];
            arr[0] = arr[1];
            arr[1] = -temp;
        }
    }

    draw_falling_shape(context, program_state,shape){

        for (let arr of shape.pos){
            let x = shape.c + arr[0] - .5 * nRows;
            let y = 15 - (shape.r + arr[1]) - 1;
            let model_transform = Mat4.translation(x*2, y*2, 0);
            let shape_color = this.get_color(shape.color_i)
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color: shape_color}));
            this.shapes.outline.draw(context, program_state, model_transform, this.white, "LINES");
        }

    }
    addShapetoGrid(){

        for (let arr of this.falling.pos){
            let newCol = this.falling.c + arr[0];
             let newRow = this.falling.r + arr[1];
             this.grid[newRow][newCol] = this.falling.color_i
        }
        this.addNext = true;
        //console.log(this.grid)

    }
    display(context, program_state) {
        super.display(context, program_state);
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            this.children.push(new defs.Program_State_Viewer());
            program_state.set_camera(Mat4.translation(0, 0, -75));    // Locate the camera here (inverted matrix).
        }
        //program_state.set_camera(Mat4.translation(0, 0, -50));
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 500);
        program_state.lights = [new Light(vec4(0, -5, -10, 1), color(1, 1, 1, 1), 100000)];
        // Draw the ground:
        this.shapes.square.draw(context, program_state, Mat4.translation(0, -20, 0)
                .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(70, 70, 1)),
            this.material);

        for (let i = 1; i < nCols - 1; i++){
            let temp = this.random_color();
            // if (program_state.animation_time % 10000 === 0)
            //     console.log(temp);
            if (this.grid[nRows-1][i] === -1)
                this.grid[nRows-1][i] = temp;

        }

        let counter_base = 0;
        let last = -1;
        for (let i = 1; i < nCols - 1; i++){ // count the last row (for elimination)
            if (this.grid[18][i] !== -1 && counter_base !== nCols)
                counter_base += 1;
        }

        if (counter_base === nCols-2) // cube elimination part
        {
            
            for (let i = 1; i < nCols - 1; i++)
            {
                this.grid[18][i] = -1;
            }

            for (let i = 1; i < nCols - 1; i++)
            {
                for (let j = nRows - 2; j > 1; j--)
                {
                    this.grid[j][i] = this.grid[j-1][i];
                }
            }
            console.log(this.grid);
        }
        

        this.draw_cube(context, program_state);


            if ( this.addNext && this.totalobj <= 10 ){
                // console.log("inside add");
                this.resetFallingShape()
                this.gene_new_obj();
                this.falling.color_i = this.random_color();
                this.addNext = false;
                this.totalobj++;
            }


        let t = program_state.animation_time / 1000
        if(t>counter){
            if(this.canMove([0,1])){
                this.move([0,1]);
            }
            else{
                this.addShapetoGrid()
            }
            counter = t+1
        }
        this.draw_falling_shape(context, program_state,this.falling)

    }
}