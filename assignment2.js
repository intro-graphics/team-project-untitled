import {defs, tiny} from './examples/common.js';

let nRows = 20;
let nCols = 20;
let EMPTY = -1;
let BORDER = -2;
let FILLED = 99;
let counter = 0.0;

// BGM part, uncomment to have BGM upon opening
// var audio = new Audio();
// audio.src = "./assets/Tetris.mp3"
// audio.autoplay = true;

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,Shader, Texture,
} = tiny;


export class Text_Line extends Shape {                           // **Text_Line** embeds text in the 3D world, using a crude texture
                                                                 // method.  This Shape is made of a horizontal arrangement of quads.
                                                                 // Each is textured over with images of ASCII characters, spelling
                                                                 // out a string.  Usage:  Instantiate the Shape with the desired
                                                                 // character line width.  Then assign it a single-line string by calling
                                                                 // set_string("your string") on it. Draw the shape on a material
                                                                 // with full ambient weight, and text.png assigned as its texture
                                                                 // file.  For multi-line strings, repeat this process and draw with
                                                                 // a different matrix.
    constructor(max_size) {
        super("position", "normal", "texture_coord");
        this.max_size = max_size;
        var object_transform = Mat4.identity();
        for (var i = 0; i < max_size; i++) {                                       // Each quad is a separate Square instance:
            defs.Square.insert_transformed_copy_into(this, [], object_transform);
            object_transform.post_multiply(Mat4.translation(1.5, 0, 0));
        }
    }

    set_string(line, context) {           // set_string():  Call this to overwrite the texture coordinates buffer with new
        // values per quad, which enclose each of the string's characters.
        this.arrays.texture_coord = [];
        for (var i = 0; i < this.max_size; i++) {
            var row = Math.floor((i < line.length ? line.charCodeAt(i) : ' '.charCodeAt()) / 16),
                col = Math.floor((i < line.length ? line.charCodeAt(i) : ' '.charCodeAt()) % 16);

            var skip = 3, size = 32, sizefloor = size - skip;
            var dim = size * 16,
                left = (col * size + skip) / dim, top = (row * size + skip) / dim,
                right = (col * size + sizefloor) / dim, bottom = (row * size + sizefloor + 5) / dim;

            this.arrays.texture_coord.push(...Vector.cast([left, 1 - bottom], [right, 1 - bottom],
                [left, 1 - top], [right, 1 - top]));
        }
        if (!this.existing) {
            this.copy_onto_graphics_card(context);
            this.existing = true;
        } else
            this.copy_onto_graphics_card(context, ["texture_coord"], false);
    }
}

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
    constructor(color) {
        super("position", "color");
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1],
            [-1, -1, 1], [1, -1, 1],
            [1, 1, -1], [-1, 1, -1],
            [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1],
            [-1, 1, -1], [-1, 1, 1],
            [1, -1, 1], [1, -1, -1],
            [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, 1, -1],
            [1, -1, 1], [1, 1, 1],
            [1, -1, -1],[1, 1, -1]
        );

        this.arrays.color = [];
        for(let i = 0; i < 24; i++){
            this.arrays.color.push(color);
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
        super();
        // this.hover = this.swarm = false;

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'cube': new Cube(),
            'outline': new Cube_Outline(color(1,1,1,1)),
            'base' : new Cube_Outline(color(0.6,0.6,0.6,1)),
            'strip': new Cube_Single_Strip(),
            'text': new Text_Line(35),
            'square': new defs.Square(),
        };

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
        // *** Materials
        const shader = new defs.Fake_Bump_Map(1);
        const texture = new defs.Textured_Phong(1);

        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#FF0000")}),
            white : new Material(new defs.Basic_Shader()),
            ground: new Material(shader, {
                color: hex_color('#000000'),
                ambient: 0.7, texture: new Texture("./assets/stars.png")
            }),
            text_image : new Material(texture, {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")
            }),
        };

        this.textures = {
            rgb: new Texture("./assets/rgb.jpg"),
            earth: new Texture("./assets/earth.gif"),
            // grid: new Texture("assets/grid.png"),
            stars: new Texture("./assets/stars.png"),
            text: new Texture("./assets/text.png"),
        }
    }

    display(context, program_state) {
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);
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
        // this.is_still = false;
        // this.is_outline = false;
        // this.is_odd = true;
        // this.totalobj = 0;
        // // this.set_colors()

        this.grid = this.initGrid();
        this.addNext = true;

        this.falling = {r:0,c:9,pos:this.shape_t.ZShape,color_i:0}

        this.over = false;
    }

    random_color() {
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
    }

    gene_new_obj()
    {
        let num = 1 + Math.floor(7 * Math.random());
        let shape = this.shape_t;
        let next_shape;
        
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
    }

    initGrid() {
        function fill(arr, value) {
            for (var i = 0; i < arr.length; i++) {
                arr[i] = value;
            }
        }
        let grid = [];
        for (let r = -1; r < nRows; r++) {
            grid[r] = new Array(nCols);
            fill(grid[r], EMPTY);
            for (let c = 0; c < nCols; c++) {
                if (c === 0 || c === nCols - 1 || r === nRows - 1)
                    grid[r][c] = BORDER;
            }
        }
        return grid;
    }


    make_control_panel() {
        this.key_triggered_button("Default View", ["v"], () => this.attached = () => "origin");
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

    draw_frame(context, program_state){
        for (let i = 0; i < nCols; i++){
            for (let j = 0; j < nRows; j++){
                if ( this.grid[i][j] === BORDER ){
                    let x = j - .5 * nRows;
                    let y = 15 - i - 1;
                    let model_transform = Mat4.translation(x*2, y*2, 0);
                    this.shapes.outline.draw(context, program_state, model_transform, this.materials.white, "LINES");
                } else if ( this.grid[i][j] !== EMPTY ){
                    let x = j - .5 * nRows;
                    let y = 15 - i - 1;
                    let model_transform = Mat4.translation(x*2, y*2, 0);
                    let color = this.get_color(this.grid[i][j]);
                    this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color: color}));
                    this.shapes.outline.draw(context, program_state, model_transform, this.materials.white, "LINES");
                }

            }
        }
        let base = Mat4.identity().times(Mat4.translation(-15,-11,0)).times(Mat4.scale(1,0.01,1)); // the flattened base
        for(let z = -10; z <= 11; z++){
            for(let x = -4; x <= 19; x++){
                this.shapes.base.draw(context, program_state, base.times(Mat4.translation(2*x-1,0,2*z-1)), this.materials.white, "LINES");
            }
        }
    }

    draw_background(context, program_state){
        // ground:
        this.shapes.square.draw(context, program_state, Mat4.translation(0, -50, 0)
                .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(70, 70, 1)),
            this.materials.ground);
        //back
        this.shapes.square.draw(context, program_state, Mat4.translation(0, 0, -70)
                .times(Mat4.scale(70, 70, 1)),
            this.materials.ground);
        //front
        this.shapes.square.draw(context, program_state, Mat4.translation(0, 0, 70)
                .times(Mat4.scale(70, 70, 1)),
            this.materials.ground);
        //up
        this.shapes.square.draw(context, program_state, Mat4.translation(0, 70, 0)
                .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(70, 70, 1)),
            this.materials.ground);
        //left
        this.shapes.square.draw(context, program_state, Mat4.translation(-70, 0, 0)
                .times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(70, 70, 1)),
            this.materials.ground);
        //right
        this.shapes.square.draw(context, program_state, Mat4.translation(70, 0, 0)
                .times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(70, 70, 1)),
            this.materials.ground);
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
            this.shapes.outline.draw(context, program_state, model_transform, this.materials.white, "LINES");
        }

    }
    addShapeToGrid(){

        for (let arr of this.falling.pos){
            let newCol = this.falling.c + arr[0];
             let newRow = this.falling.r + arr[1];
             this.grid[newRow][newCol] = this.falling.color_i
        }
        this.addNext = true;
    }

    eliminateRows(){
        // eliminate rows from bottom if the row is filled
        for (let row = 18; row >= 0; row--){
            let should_eliminate = true;
            for (let i = 1; i < 19; i++){
                // if any grid is empty, false
                if (this.grid[row][i] === EMPTY){
                    should_eliminate = false;
                }
            }
            if ( should_eliminate ){
                // this moves a entire row down
                for (let i = row; i > 0; i--){
                    this.grid[i] = this.grid[i-1];
                }
                // this is used to make sure the top row is correct
                for (let j = 1; j < 19; j++){
                    this.grid[0][j] = EMPTY;
                }
                row = row + 1; // reduce the number of checked row
            }
        }
    }

    check_continue(){
        // current height of grid is 20, if reach 18, gameover
        for (let i = 1; i < 19; i++){
            if (this.grid[1][i] !== EMPTY){
                this.over = true;
            }
        }
    }

    display(context, program_state) {
        super.display(context, program_state);

        if(this.attached !== undefined) {
            let desired = this.attached();
            if(desired === "origin"){
                desired = Mat4.translation(0, -5, -65);
            }
            desired = desired.map((x,i) => Vector.from( program_state.camera_inverse[i]).mix(x, 0.1));
            program_state.set_camera(desired);
        }

        // score display, according to the template in text-demo.js
        let score = "Score: 888";
        this.shapes.text.set_string(score, context.context);
        this.shapes.text.draw(context, program_state, Mat4.identity().times(Mat4.translation(23, 25, 0)), this.materials.text_image);


        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            this.children.push(new defs.Program_State_Viewer());
            program_state.set_camera(Mat4.translation(0, -5, -65));    // Locate the camera here (inverted matrix).
        }
        //program_state.set_camera(Mat4.translation(0, 0, -50));
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 500);
        program_state.lights = [new Light(vec4(0, -5, -10, 1), color(1, 1, 1, 1), 100000)];

        this.draw_frame(context, program_state);
        this.draw_background(context, program_state);

        if ( !this.over ){
            if ( this.addNext){
                // console.log("inside add");
                this.resetFallingShape()
                this.gene_new_obj();
                this.falling.color_i = this.random_color();
                this.addNext = false;
                // this.totalobj++;
            }


            let t = program_state.animation_time / 1000
            if(t>counter){
                if(this.canMove([0,1])){
                    this.move([0,1]);
                }
                else{
                    this.addShapeToGrid();
                    this.eliminateRows();
                    this.check_continue();
                }
                counter = t+1
            }
            this.draw_falling_shape(context, program_state,this.falling)
        }  

    }
}