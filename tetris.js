import {defs, tiny} from './examples/common.js';
import {Jshape,Lshape,Lout,squareShape,Ishape} from './texture.js'

// Pull these names into this module's scope for convenience:
const {vec3, unsafe3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;


let nRows = 17;
let nCols = 18;
let EMPTY = -1
let BORDER = -2
let FILLED = 99

export class Body {
    // **Body** can store and update the properties of a 3D body that incrementally
    // moves from its previous place due to velocities.  It conforms to the
    // approach outlined in the "Fix Your Timestep!" blog post by Glenn Fiedler.
    constructor(shape, material, size) {
        Object.assign(this,
            {shape, material, size})
        this.num_rotation = 0;
        this.still = false;
         
        this.pos = []
        for(let i of this.shape.pos){
            this.pos.push(i.slice())
        }
        
        
    }

    // (within some margin of distance).
    static intersect_cube(p, margin = 0) {
        //console.log(p)
        return p.every(value => value >= -1 - margin && value <= 1 + margin)
    }

    static intersect_sphere(p, margin = 0) {
        return p.dot(p) < 1 + margin;
    }

    emplace(location_matrix, linear_velocity, angular_velocity, spin_axis = vec3(0, 0, 0).randomized(1).normalized()) {                               // emplace(): assign the body's initial values, or overwrite them.
        this.center = location_matrix.times(vec4(0, 0, 0, 1)).to3();
        //console.log(this.center)
        this.rotation = Mat4.translation(...this.center.times(-1)).times(location_matrix);
        this.previous = {center: this.center.copy(), rotation: this.rotation.copy()};
        // drawn_location gets replaced with an interpolated quantity:
        this.drawn_location = location_matrix;
        //console.log(this.drawn_location)
        this.temp_matrix = Mat4.identity();
        return Object.assign(this, {linear_velocity, angular_velocity, spin_axis})
    }

    advance(time_amount) {
        // advance(): Perform an integration (the simplistic Forward Euler method) to
        // advance all the linear and angular velocities one time-step forward.
        this.previous = {center: this.center.copy(), rotation: this.rotation.copy()};
        // Apply the velocities scaled proportionally to real time (time_amount):
        // Linear velocity first, then angular:
        this.center = this.center.plus(this.linear_velocity.times(time_amount));
        this.rotation.pre_multiply(Mat4.rotation(time_amount * this.angular_velocity, ...this.spin_axis));
    }

    // The following are our various functions for testing a single point,
    // p, against some analytically-known geometric volume formula

    blend_rotation(alpha) {
        // blend_rotation(): Just naively do a linear blend of the rotations, which looks
        // ok sometimes but otherwise produces shear matrices, a wrong result.

        // TODO:  Replace this function with proper quaternion blending, and perhaps
        // store this.rotation in quaternion form instead for compactness.
        return this.rotation.map((x, i) => vec4(...this.previous.rotation[i]).mix(x, alpha));
    }

    blend_state(alpha) {
        // blend_state(): Compute the final matrix we'll draw using the previous two physical
        // locations the object occupied.  We'll interpolate between these two states as
        // described at the end of the "Fix Your Timestep!" blog post.
        this.drawn_location = Mat4.translation(...this.previous.center.mix(this.center, alpha))
            .times(this.blend_rotation(alpha))
            .times(Mat4.scale(...this.size));
    }

    check_if_colliding(b, collider) {
        // check_if_colliding(): Collision detection function.
        // DISCLAIMER:  The collision method shown below is not used by anyone; it's just very quick
        // to code.  Making every collision body an ellipsoid is kind of a hack, and looping
        // through a list of discrete sphere points to see if the ellipsoids intersect is *really* a
        // hack (there are perfectly good analytic expressions that can test if two ellipsoids
        // intersect without discretizing them into points).
        if (this == b)
            return false;
        // Nothing collides with itself.
        // Convert sphere b to the frame where a is a unit sphere:
        const T = this.inverse.times(b.drawn_location, this.temp_matrix);

        const {intersect_test, points, leeway} = collider;
        // For each vertex in that b, shift to the coordinate frame of
        // a_inv*b.  Check if in that coordinate frame it penetrates
        // the unit sphere at the origin.  Leave some leeway.
        //console.log(points.arrays.position)
        
        return points.arrays.position.some(p =>
            intersect_test(T.times(p.to4(1)).to3(), leeway));
    }

    check(){
        console.log("shape")
        let arr= this.shape.arrays.position.map(p =>
            this.drawn_location.times(p.to4(1)).to3());
        console.log(arr)
       
    }
}


export class Simulation extends Scene {
    // **Simulation** manages the stepping of simulation time.  Subclass it when making
    // a Scene that is a physics demo.  This technique is careful to totally decouple
    // the simulation from the frame rate (see below).
    constructor() {
        super();
        Object.assign(this, {time_accumulator: 0, time_scale: 1, t: 0, dt: 1 / 20, bodies: [], steps_taken: 0});
        //slow down the time for demo purpose
        this.time_scale /= 625;
    }

    simulate(frame_time) {
        // simulate(): Carefully advance time according to Glenn Fiedler's
        // "Fix Your Timestep" blog post.
        // This line gives ourselves a way to trick the simulator into thinking
        // that the display framerate is running fast or slow:
        frame_time = this.time_scale * frame_time;

        // Avoid the spiral of death; limit the amount of time we will spend
        // computing during this timestep if display lags:
        this.time_accumulator += Math.min(frame_time, 0.1);
        // Repeatedly step the simulation until we're caught up with this frame:
        while (Math.abs(this.time_accumulator) >= this.dt) {
            // Single step of the simulation for all bodies:
            this.update_state(this.dt);
            for (let b of this.bodies){
                if(!b.still)
                b.advance(this.dt);
            }
            // Following the advice of the article, de-couple
            // our simulation time from our frame rate:
            this.t += Math.sign(frame_time) * this.dt;
            this.time_accumulator -= Math.sign(frame_time) * this.dt;
            this.steps_taken++;
        }
        // Store an interpolation factor for how close our frame fell in between
        // the two latest simulation time steps, so we can correctly blend the
        // two latest states and display the result.
        let alpha = this.time_accumulator / this.dt;
        for (let b of this.bodies) b.blend_state(alpha);
    }

    make_control_panel() {
        // make_control_panel(): Create the buttons for interacting with simulation time.
        this.key_triggered_button("Speed up time", ["Shift", "T"], () => this.time_scale *= 5);
        this.key_triggered_button("Slow down time", ["t"], () => this.time_scale /= 5);
        this.new_line();
        this.live_string(box => {
            box.textContent = "Time scale: " + this.time_scale
        });
        this.new_line();
        this.live_string(box => {
            box.textContent = "Fixed simulation time step size: " + this.dt
        });
        this.new_line();
        this.live_string(box => {
            box.textContent = this.steps_taken + " timesteps were taken so far."
        });

    }

    display(context, program_state) {
        // display(): advance the time and state of our whole simulation.
        if (program_state.animate)
            this.simulate(program_state.animation_delta_time);
        // Draw each shape at its current location:
        for (let b of this.bodies)
            b.shape.draw(context, program_state, b.drawn_location, b.material);
    }

    update_state(dt)      // update_state(): Your subclass of Simulation has to override this abstract function.
    {
        throw "Override this"
    }
}


export class Test_Data {
    // **Test_Data** pre-loads some Shapes and Textures that other Scenes can borrow.
    constructor() {
        this.textures = {
            rgb: new Texture("assets/rgb.jpg"),
            earth: new Texture("assets/earth.gif"),
            // grid: new Texture("assets/grid.png"),
            stars: new Texture("assets/stars.png"),
            text: new Texture("assets/text.png"),
        }
        this.shapes = {
            donut: new defs.Torus(15, 15, [[0, 2], [0, 1]]),
            cone: new defs.Closed_Cone(4, 10, [[0, 2], [0, 1]]),
            capped: new defs.Capped_Cylinder(4, 12, [[0, 2], [0, 1]]),
            ball: new defs.Subdivision_Sphere(3, [[0, 1], [0, 1]]),
            cube: new defs.Cube(),
            prism: new (defs.Capped_Cylinder.prototype.make_flat_shaded_version())(10, 10, [[0, 2], [0, 1]]),
            gem: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
            donut2: new (defs.Torus.prototype.make_flat_shaded_version())(20, 20, [[0, 2], [0, 1]]),
        };
    }

    random_shape(shape_list = this.shapes) {
        // random_shape():  Extract a random shape from this.shapes.
        const shape_names = Object.keys(shape_list);
        return shape_list[shape_names[~~(shape_names.length * Math.random())]]
    }
}


export class Test_Demo extends Simulation {
    // ** Inertia_Demo** demonstration: This scene lets random initial momentums
    // carry several bodies until they fall due to gravity and bounce.
    constructor() {
        super();
        this.data = new Test_Data();
        this.addNext = true;
        this.index = 0;
        this.move = true;
        this.dis = true;
        this.grid = this.initGrid();
        //console.log(grid)
        //this.shapes = Object.assign({}, this.data.shapes);
        this.collider = {intersect_test: Body.intersect_cube, points: new defs.Cube(), leeway: 1};
        this.shapes = {
            Lshape : new Lshape(),
            jshape: new Jshape(),
            ishape: new Ishape(),
            prism: new (defs.Capped_Cylinder.prototype.make_flat_shaded_version())(10, 10, [[0, 2], [0, 1]]),
            gem: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
            donut2: new (defs.Torus.prototype.make_flat_shaded_version())(20, 20, [[0, 2], [0, 1]]),
        };
        this.shapes.square = new defs.Square();
        const shader = new defs.Fake_Bump_Map(1);
        this.material = new Material(shader, {
            color: color(.4, .8, .4, 1),
            ambient: .4, texture: this.data.textures.stars
        })
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .6, diffusivity: .6, specularity: .1, color: color(.9, .2, .4, 1)}),
        };
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
        for (var r = 0; r < nRows; r++) {
            grid[r] = new Array(nCols);
            fill(grid[r], -1);
            for (var c = 0; c < nCols; c++) {
                if (c === 0 || c === nCols - 1 || r === nRows - 1)
                    grid[r][c] = -2;
            }
        }
        return grid;
    }

    getGridCoord(body){
        let r = 16-(Math.round(body.center[1]/2.0)+6)
        
        let c = Math.round(body.center[0]/2.0)+7
        
        return [r,c];
    }

    canMove(body) {
        let out = this;
        return body.pos.every(function (p) {
            
            let arr = out.getGridCoord(body);
           //console.log(arr)
            let r = arr[0]+p[1]+1;
            let c = arr[1]+p[0];
            //console.log(r)
            return out.grid[r][c] === EMPTY;
        });
    }
    update_state(dt) {
        // update_state():  Override the base time-stepping code to say what this particular
        // scene should do to its bodies every frame -- including applying forces.
        // Generate additional moving bodies if there ever aren't enough:
        //while (this.bodies.length < 2)
      
        if(this.addNext&&this.bodies.length < 5){
            var random_color = color(Math.random(), Math.random(), Math.random(), 1.0);  // color of falling blocks defined here
            this.bodies.push(new Body(this.shapes.Lshape, this.materials.plastic.override({color: random_color}), vec3(1, 1, 1))
                .emplace(Mat4.translation(...vec3(0, 15, 0)),
                    vec3(0, -1, 0), 0));
                    //console.log(this.bodies[this.index].center)
                    this.addNext = false;
                    this.index++;
        }

        let b = this.bodies[this.index-1];
    
            // Gravity on Earth, where 1 unit in world space = 1 meter:
            
            b.linear_velocity[1] += dt * -0.2;
            if(this.move == true){
                let model_transform = b.drawn_location.times(Mat4.translation(2, 0, 0))
                b.emplace(model_transform,b.linear_velocity,0);
                this.move = false;
            }
            
            // If about to fall through floor, reverse y velocity:
            b.inverse = Mat4.inverse(b.drawn_location);
            //if ((!b.still&&this.index===1&&b.center[1] < -8) ||(!b.still&&this.index==2&&b.center[1] < -4)){
            if (!b.still&&!this.canMove(b)){
                b.linear_velocity[1] = 0;
                b.linear_velocity[0] = 0;
                b.linear_velocity[2] = 0;
                console.log(b.center)
                let gridCord = this.getGridCoord(b);
                let r = gridCord[0]
                let c = gridCord[1]
                
                let out = this;
                b.pos.forEach(function (p) {
                    out.grid[r + p[1]][c + p[0]] = 99;
                });
                
                
                console.log(this.grid);
               
                
                //console.log(b.shape.arrays.position)
                b.still = true;
                this.addNext = true;
            }
            
            for (let c of this.bodies){
                if (b.check_if_colliding(c, this.collider)){
                    b.linear_velocity[1] = 0;
                    b.linear_velocity[0] = 0;
                    b.linear_velocity[2] = 0;
                    this.addNext = true;
                }
            }
        
        // Delete bodies that stop or stray too far away:
        //this.bodies = this.bodies.filter(b => b.center.norm() < 50 && b.linear_velocity.norm() > 2);
    }

    display(context, program_state) {
        // display(): Draw everything else in the scene besides the moving bodies.
        super.display(context, program_state);

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            this.children.push(new defs.Program_State_Viewer());
            program_state.set_camera(Mat4.translation(0, 0, -50));    // Locate the camera here (inverted matrix).
        }
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 500);
        program_state.lights = [new Light(vec4(0, -5, -10, 1), color(1, 1, 1, 1), 100000)];
        // Draw the ground:
        this.shapes.square.draw(context, program_state, Mat4.translation(0, -10, 0)
                .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(50, 50, 1)),
            this.material.override(this.data.textures.earth));
        // let model_transform = Mat4.identity()
        // this.shapes.jshape.draw(context, program_state, model_transform, this.materials.plastic);
    }

    make_control_panel() {
        super.make_control_panel();

        this.new_line();
        this.key_triggered_button("Rotate", ["i"], () => {
            let currentBody = this.bodies[this.bodies.length-1];
            let model_transform = currentBody.drawn_location.times(Mat4.rotation(Math.PI/2,0,0,1));
            currentBody.num_rotation = (currentBody.num_rotation + 1) % 4;
            console.log(currentBody.num_rotation);
            currentBody.pos.forEach(function (row) {
                var tmp = row[0];
                row[0] = row[1];
                row[1] = -tmp;
            });
            currentBody.emplace(model_transform,currentBody.linear_velocity,0);
           
        });
        this.new_line();
        this.key_triggered_button("left", ["j"], () => {
            let currentBody = this.bodies[this.bodies.length-1];
            let model_transform = currentBody.drawn_location;
            // if the body has been rotated before, first rotate back by -theta and do translation, then rotate back theta angle
            if(currentBody.num_rotation !== 0){
                let rotate_back_angle = - currentBody.num_rotation * Math.PI/2;
                model_transform = model_transform.times(Mat4.rotation(rotate_back_angle, 0, 0, 1));
            }
            model_transform = model_transform.times(Mat4.translation(-2,0,0));
            if(currentBody.num_rotation !== 0){
                let rotate_back_angle = currentBody.num_rotation * Math.PI/2;
                model_transform = model_transform.times(Mat4.rotation(rotate_back_angle, 0, 0, 1));
            }
            currentBody.emplace(model_transform,currentBody.linear_velocity,0);
        });
        this.key_triggered_button("right", ["l"], () => {
            let currentBody = this.bodies[this.bodies.length-1];
            let model_transform = currentBody.drawn_location;
            if(currentBody.num_rotation !== 0){
                let rotate_back_angle = - currentBody.num_rotation * Math.PI/2;
                model_transform = model_transform.times(Mat4.rotation(rotate_back_angle, 0, 0, 1));
            }
            model_transform = model_transform.times(Mat4.translation(2,0,0));
            if(currentBody.num_rotation !== 0){
                let rotate_back_angle = currentBody.num_rotation * Math.PI/2;
                model_transform = model_transform.times(Mat4.rotation(rotate_back_angle, 0, 0, 1));
            }
            currentBody.emplace(model_transform,currentBody.linear_velocity,0);
        });
        this.key_triggered_button("down", ["k"], () => {
            let currentBody = this.bodies[this.bodies.length-1];
            if(currentBody.center[1] < -8) return;
            let model_transform = currentBody.drawn_location;
            if(currentBody.num_rotation !== 0){
                let rotate_back_angle = - currentBody.num_rotation * Math.PI/2;
                model_transform = model_transform.times(Mat4.rotation(rotate_back_angle, 0, 0, 1));
            }
            model_transform = model_transform.times(Mat4.translation(0,-1,0));
            if(currentBody.num_rotation !== 0){
                let rotate_back_angle = currentBody.num_rotation * Math.PI/2;
                model_transform = model_transform.times(Mat4.rotation(rotate_back_angle, 0, 0, 1));
            }
            currentBody.emplace(model_transform,currentBody.linear_velocity,0);
        });
    }

    show_explanation(document_element) {
        document_element.innerHTML += `<p>This demo lets random initial momentums carry bodies until they fall and bounce.  It shows a good way to do incremental movements, which are crucial for making objects look like they're moving on their own instead of following a pre-determined path.  Animated objects look more real when they have inertia and obey physical laws, instead of being driven by simple sinusoids or periodic functions.
                                     </p><p>For each moving object, we need to store a model matrix somewhere that is permanent (such as inside of our class) so we can keep consulting it every frame.  As an example, for a bowling simulation, the ball and each pin would go into an array (including 11 total matrices).  We give the model transform matrix a \"velocity\" and track it over time, which is split up into linear and angular components.  Here the angular velocity is expressed as an Euler angle-axis pair so that we can scale the angular speed how we want it.
                                     </p><p>The forward Euler method is used to advance the linear and angular velocities of each shape one time-step.  The velocities are not subject to any forces here, but just a downward acceleration.  Velocities are also constrained to not take any objects under the ground plane.
                                     </p><p>This scene extends class Simulation, which carefully manages stepping simulation time for any scenes that subclass it.  It totally decouples the whole simulation from the frame rate, following the suggestions in the blog post <a href=\"https://gafferongames.com/post/fix_your_timestep/\" target=\"blank\">\"Fix Your Timestep\"</a> by Glenn Fielder.  Buttons allow you to speed up and slow down time to show that the simulation's answers do not change.</p>`;
    }
}
