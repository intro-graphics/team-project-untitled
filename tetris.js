import {defs, tiny} from './examples/common.js';
import {Color_Phong_Shader, Shadow_Textured_Phong_Shader,Buffered_Texture, LIGHT_DEPTH_TEX_SIZE} from './shadow-demo-shaders.js'
import {Text_Line} from "./examples/text-demo.js";
let nRows = 20;
let nCols = 20;
let EMPTY = -1;
let BORDER = -2;
let counter = 0.0;

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,Shader, Texture,
} = tiny;
const {Cube, Textured_Phong, Phong_Shader, Basic_Shader, Subdivision_Sphere} = defs

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

export class Tetris extends Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */
    constructor(){
        super();

        // audio initialization
        this.audio = new Audio();
        this.mute_flag = false;
        this.audio.src = "./assets/Tetris.mp3";
        this.audio.autoplay = true;

        // for physics simulation of cube falling after pressing down button
        this.recordStartTime = false;
        this.accelerate = false;
        this.switch = false;
        this.acc = 1;
        this.startTime = 0;

        // scoring
        this.score = 0;
        this.maxScore = 0;

        this.shapes = {
            'cube': new Cube(),
            "sphere": new Subdivision_Sphere(6),
            'outline': new Cube_Outline(color(1,1,1,1)),
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
                {ambient: 0.8, diffusivity: 1, color: color(1,1,1,1)}),
            floor : new Material(new Shadow_Textured_Phong_Shader(1), {
                color: color(0.5, 1, 1, 1), ambient: 0.4, diffusivity: 0.6,
                color_texture: null,
                light_depth_texture: null
            }),
            floor_2: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: color(0.5, 1, 1, 1), ambient: .3, diffusivity: 0.6, specularity: 0.4, smoothness: 64,
                color_texture: null,
                light_depth_texture: null
            }),
            white : new Material(new defs.Basic_Shader()),
            pure : new Material(new Color_Phong_Shader(), {
            }),
            light_src : new Material(new Phong_Shader(), {
                color: color(1, 1, 1, 1), ambient: 1, diffusivity: 0, specularity: 0
            }),
            ground: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: hex_color('#000000'),
                ambient: 0.7, color_texture: new Texture("./assets/stars.png"),light_depth_texture: null
            }),

            text_image : new Material(texture, {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")
            }),

            stone: new Material(new Textured_Phong(),
                {ambient: 0.8, diffusivity: 1, 
                texture: new Texture("assets/marble2.jpeg")
            }),
        };

        this.textures = {
            rgb: new Texture("./assets/rgb.jpg"),
            earth: new Texture("./assets/earth.gif"),
            // grid: new Texture("assets/grid.png"),
            stars: new Texture("./assets/stars.png"),
            text: new Texture("./assets/text.png"),
            stone: new Texture("./assets/stone.jpeg")
        }
        this.grid = this.initGrid();
        this.addNext = true;

        this.falling = {r:0,c:9,pos:this.shape_t.ZShape,color_i:0}

        this.over = false;
        this.init_ok = false;
        this.light_src = new Material(new Phong_Shader(), {
            color: color(1, 1, 1, 1), ambient: 1, diffusivity: 0, specularity: 0
        });
    }

    random_color() {
        return Math.floor(4 * Math.random());
    }


    texture_buffer_init(gl) {
        // Depth Texture
        this.lightDepthTexture = gl.createTexture();
        // Bind it to TinyGraphics
        this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);
        //this.stars.light_depth_texture = this.light_depth_texture
        this.materials.floor.light_depth_texture = this.light_depth_texture
        this.materials.floor_2.light_depth_texture = this.light_depth_texture
        this.materials.ground.light_depth_texture = this.light_depth_texture
        this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
        gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT, // internal format
            this.lightDepthTextureSize,   // width
            this.lightDepthTextureSize,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.UNSIGNED_INT,    // type
            null);              // data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Depth Texture Buffer
        this.lightDepthFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point
            gl.TEXTURE_2D,        // texture target
            this.lightDepthTexture,         // texture
            0);                   // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // create a color texture of the same size as the depth texture
        // see article why this is needed_
        this.unusedTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.lightDepthTextureSize,
            this.lightDepthTextureSize,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // attach it to the framebuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point
            gl.TEXTURE_2D,         // texture target
            this.unusedTexture,         // texture
            0);                    // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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


    gene_new_obj() {
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
        this.new_line();
        this.key_triggered_button("Music Start/Mute", ["m"], () => {
            // control the mute and start of game
            if(this.mute_flag)
            {
                this.audio.pause();
                this.mute_flag = !this.mute_flag;
            }
            else
            {

                this.audio.currentTime = 0;
                this.audio.volume = 0.15;
                this.audio.play();
                this.mute_flag = !this.mute_flag;
            }
        });
        this.new_line();
        this.key_triggered_button("Restart", ["r"], () => {
            this.grid = this.initGrid();
            this.over = false;
            this.addNext = true;
            this.falling = {r:0,c:9,pos:this.shape_t.ZShape,color_i:0}
            this.over = false;
            this.init_ok = false;
            this.recordStartTime = false;
            this.accelerate = false;
            this.acc = 1;
            this.startTime = 0;

            // scoring
            this.score = 0;
        })
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
            if(this.switch){
                this.accelerate = true;
                this.recordStartTime = true;
            }
            else
            {
                if(this.canMove([0,1]))
                    this.move([0,1]);
            }
        });
        this.key_triggered_button("Switch drop style", ["s"], () => {
            this.switch = !this.switch
        });
    }

    resetFallingShape(){
        this.falling.r = 0
        this.falling.c = 9
    }

    draw_frame(context, program_state,shadow_pass){
        // let model_transform = Mat4.translation(0, )
        // this.shapes.cube.draw(context, program_state, model_transform, shadow_pass?this.materials.floor.override({color: hex_color("#ff0000")}):this.materials.pure)
        for (let i = 0; i < nCols; i++){
            for (let j = 0; j < nRows; j++){
                if ( this.grid[i][j] === BORDER /* && i != nCols - 1 */){
                    let x = j - .5 * nRows;
                    let y = 15 - i - 1;
                    let model_transform = Mat4.translation(x*2, y*2, 0);
                    this.shapes.outline.draw(context, program_state, model_transform, this.materials.white, "LINES");
                    if (i === 0){
                        this.shapes.cube.draw(context, program_state, model_transform, shadow_pass?this.materials.floor.override({color: hex_color("#ff0000")}):this.materials.pure);
                    }
                    for (var k = 1; k < 19; k++){
                        if (this.grid[i][k] !== EMPTY && this.grid[i][k] !== BORDER){
                            // console.log(i/19.0);
                            this.shapes.cube.draw(context, program_state, model_transform, shadow_pass?this.materials.floor.override({color: color((19 - i)/19.0, i/19.0, 0, 1)}):this.materials.pure);
                        }
                    }
                } else if ( this.grid[i][j] !== EMPTY && i !== (nCols - 1)){
                    let x = j - .5 * nRows;
                    let y = 15 - i - 1;
                    let model_transform = Mat4.translation(x*2, y*2, 0);
                    let color = this.get_color(this.grid[i][j]);
                    if (this.over)
                        color = hex_color("#808080");
                    this.shapes.cube.draw(context, program_state, model_transform, shadow_pass?this.materials.floor.override({color: color}):this.materials.pure);
                    this.shapes.outline.draw(context, program_state, model_transform, this.materials.white, "LINES");
                }

            }
        }
        //ground for shadowing
        let model_trans_floor = Mat4.translation(-6,-12,0).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(40, 40, 0.01));

        this.shapes.cube.draw(context, program_state, model_trans_floor,
            shadow_pass?this.materials.floor_2:this.materials.pure);

    }

    draw_background(context, program_state,shadow_pass){
        // ground:
        this.shapes.cube.draw(context, program_state, Mat4.translation(0, -50, 0)
                .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(70, 70, 0.01)),
            shadow_pass? this.materials.ground:this.materials.pure);
        //back
        this.shapes.cube.draw(context, program_state, Mat4.translation(0, 0, -70)
                .times(Mat4.scale(70, 70, 0.01)),
            shadow_pass? this.materials.ground:this.materials.pure);
        //front
        this.shapes.cube.draw(context, program_state, Mat4.translation(0, 0, 70)
                .times(Mat4.scale(70, 70, 0.01)),
            shadow_pass? this.materials.ground:this.materials.pure);
        //up
        this.shapes.cube.draw(context, program_state, Mat4.translation(0, 70, 0)
                .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(70, 70, 0.01)),
            shadow_pass? this.materials.ground:this.materials.pure);
        //left
        this.shapes.cube.draw(context, program_state, Mat4.translation(-70, 0, 0)
                .times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(70, 70, 0.01)),
            shadow_pass? this.materials.ground:this.materials.pure);
        //right
        this.shapes.cube.draw(context, program_state, Mat4.translation(70, 0, 0)
                .times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(70, 70, 0.01)),
            shadow_pass? this.materials.ground:this.materials.pure);
    }

    canMove(dir){
        for (let arr of this.falling.pos){
            let newCol = this.falling.c + arr[0] + dir[0];
            let newRow = this.falling.r + arr[1] + dir[1];
            if (newCol >= 19 || newRow >= 19)
                return false;
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

    draw_falling_shape(context, program_state,shape,shadow_pass){

        for (let arr of shape.pos){
            let x = shape.c + arr[0] - .5 * nRows;
            let y = 15 - (shape.r + arr[1]) - 1;
            let model_transform = Mat4.translation(x*2, y*2, 0);

            let shape_color = this.get_color(shape.color_i)
            //console.log(shadow_pass)
            this.shapes.cube.draw(context, program_state, model_transform, shadow_pass ? this.materials.floor.override({color: shape_color}):this.materials.pure);
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
                this.score += 100;
                this.maxScore = this.score < this.maxScore ? this.maxScore : this.score
            }
        }
    }

    check_continue(){
        // current height of grid is 20, if reach 18, gameover
        for (let i = 1; i < 19; i++){
            if (this.grid[1][i] !== EMPTY){
                this.over = true;
                this.maxScore = this.score < this.maxScore ? this.maxScore : this.score ;
            }
        }
    }

    //game logic
    render_scene(context, program_state, shadow_pass, draw_light_source=false, draw_shadow=false) {
        let light_position = this.light_position;
        let light_color = this.light_color;
        //const t = program_state.animation_time;

        program_state.draw_shadow = draw_shadow;
        // score display, according to the template in text-demo.js
        let score = "Score: ";
        let scoreStr = this.score.toString();
        score = score.concat(scoreStr);
        this.shapes.text.set_string(score, context.context);
        this.shapes.text.draw(context, program_state, Mat4.identity().times(Mat4.translation(23, 25, 0)), this.materials.text_image);
        let max_score = "Max Score: ";
        let maxScoreStr = this.maxScore.toString();
        max_score = max_score.concat(maxScoreStr);
        this.shapes.text.set_string(max_score, context.context);
        this.shapes.text.draw(context, program_state, Mat4.identity().times(Mat4.translation(23, 20, 0)), this.materials.text_image);

        if (draw_light_source && shadow_pass) {
            this.shapes.cube.draw(context, program_state,
                Mat4.translation(light_position[0], light_position[1], light_position[2]).times(Mat4.scale(.5,.5,.5)),
                this.light_src.override({color: light_color}));
        }
        this.draw_frame(context, program_state,shadow_pass);
        this.draw_background(context, program_state,shadow_pass);

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
                if (this.recordStartTime){
                    this.startTime = t;
                    this.recordStartTime = false;
                }
                if (this.canMove([0, 1])){
                    if (this.accelerate){
                        for (let i = 0; i < (t-this.startTime)*this.acc; i++){
                            if (this.canMove([0, 1])){
                                this.move([0, 1]);
                            }
                        }
                    }
                    else {
                        this.move([0, 1]);
                    }
                } else {
                    this.score += 5;
                    this.maxScore = this.score < this.maxScore ? this.maxScore : this.score
                    this.addShapeToGrid();
                    this.eliminateRows();
                    this.check_continue();
                    this.accelerate = false;
                }

                counter = t+0.5;
            }

        }
        this.draw_falling_shape(context, program_state,this.falling,shadow_pass);
    }


    display(context, program_state) {
        //super.display(context, program_state);
        const t = program_state.animation_time;
        const gl = context.context;

        if (!this.init_ok) {
            const ext = gl.getExtension('WEBGL_depth_texture');
            if (!ext) {
                return alert('need WEBGL_depth_texture');  // eslint-disable-line
            }
            this.texture_buffer_init(gl);

            this.init_ok = true;
        }

        if(this.attached !== undefined) {
            let desired = this.attached();
            if(desired === "origin"){
                program_state.set_camera( Mat4.translation(0, -5, -65));
                this.attached = undefined;
            }
        }


        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            this.children.push(new defs.Program_State_Viewer());
            program_state.set_camera(Mat4.translation(0, -5, -65));    // Locate the camera here (inverted matrix).
        }
        this.light_position = Mat4.identity().times(vec4(2, 60, 0, 1));
        this.light_color = color(1,1,1,1);


        // This is a rough target of the light.
        // Although the light is point light, we need a target to set the POV of the light
        this.light_view_target = vec4(0, 0, 0, 1);
        this.light_field_of_view = 130 * Math.PI / 180; // 130 degree

        program_state.lights = [new Light(this.light_position, this.light_color, 1000)];

        // Step 1: set the perspective and camera to the POV of light
        const light_view_mat = Mat4.look_at(
            vec3(this.light_position[0], this.light_position[1], this.light_position[2]),
            vec3(this.light_view_target[0], this.light_view_target[1], this.light_view_target[2]),
            vec3(0, 1, 0), // assume the light to target will have a up dir of +y, maybe need to change according to your case
        );
        const light_proj_mat = Mat4.perspective(this.light_field_of_view, 1, 0.5, 500);
        // Bind the Depth Texture Buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.viewport(0, 0, this.lightDepthTextureSize, this.lightDepthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Prepare uniforms
        program_state.light_view_mat = light_view_mat;
        program_state.light_proj_mat = light_proj_mat;
        program_state.light_tex_mat = light_proj_mat;
        program_state.view_mat = light_view_mat;
        program_state.projection_transform = light_proj_mat;
        this.render_scene(context, program_state, false,false, false);

        // Step 2: unbind, draw to the canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        program_state.view_mat = program_state.camera_inverse;
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.5, 500);
        this.render_scene(context, program_state, true,true, true);

        if(this.audio.currentTime > 83.7)
        {
            this.audio.currentTime = 0; // reset the audio for loop playing
        }

    }
}

