Vue.use(Buefy.default);
const options = new Vue();
var WFType = null;
var display_wf = true, display_prob = true;
var Types = ["1D_INF_WELL", "1D_FIN_WELL", "1D_SHO", "3D_BOX", "3D_SHO", "3D_R"];

// Create map with all the variables needed to change wavefunction properties
var WF_VARS = new Map();
WF_VARS.set("1D_INF_WELL_n", 1);
WF_VARS.set("1D_FIN_WELL_n", 1);
WF_VARS.set("1D_SHO_m", 1); 
WF_VARS.set("1D_SHO_w", 1); 
WF_VARS.set("3D_BOX_nx", 1);
WF_VARS.set("3D_BOX_ny", 1);
WF_VARS.set("3D_BOX_nz", 1);
WF_VARS.set("3D_SHO_m", 1); 
WF_VARS.set("3D_SHO_wx", 1); 
WF_VARS.set("3D_SHO_wy", 1); 
WF_VARS.set("3D_SHO_wz", 1);
WF_VARS.set("3D_R_n", 1);
WF_VARS.set("3D_R_l", 0);
WF_VARS.set("WF_R_m", 0); 

// Variable used for updating changes
var wfChanged = false;

window.onload = function () {
    options.$mount('#options'); 

    // Show correct inputs based on selected wavefunction type
    $("#typeSelect").change(function(){
        $(".hide").hide();
        WFType = $("#typeSelect").val();
        var index = Types.indexOf(WFType);
        $("#" + Types[index]).show();
        wfChanged = true;
    });

    // Add change listeners for each variable
    for(var key of WF_VARS.keys()){
        $("#" + key).change(function(e){
            var tempID = e.currentTarget.id;
            WF_VARS.set(tempID, parseInt($("#" + tempID).val()));
            wfChanged = true;
        });
    }

    // Add change listeners on the switches for displaying
    // the wavefunction and the probability distribution
    $("#WF_ON").change(function(){
        display_wf = !display_wf;
        console.log(display_wf);
        wfChanged = true;
    });

    $("#PROB_ON").change(function(){
        display_prob = !display_prob;
        wfChanged = true;
    })

    // Initially hide display switches (only used for 1D)
    $("#WF_ON").hide();
    $("#PROB_ON").hide();

    // Run visualizer code
    initVisualizer();
    animate();
};

// Create global variables that are needed for the visualizer
var main_scene, camera, renderer, controls, stats;
var visualizer_div;

function initVisualizer(){
    // Initialize Renderer
    visualizer_div = document.getElementById("visualizer");
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(visualizer_div.offsetWidth, visualizer_div.offsetHeight);
    visualizer_div.appendChild(renderer.domElement);

    // Create scene and camera.
    main_scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75, visualizer_div.offsetWidth / visualizer_div.offsetHeight, 0.1, 1000
    );

    // Add listener that checks to see if the size of the
    // window has changed and adjust accordingly.
    window.addEventListener('resize', function() {
        camera.aspect = visualizer_div.offsetWidth / visualizer_div.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(visualizer_div.offsetWidth, visualizer_div.offsetHeight);
    }, false); 

    // Initialize orbiting controls.
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.2;
    camera.position.set(0, 0, 3);
    controls.update();
}

function update(){

    // If still in null mode draw the null scene
    if(WFType == null) drawNullScene(main_scene);

    // Check if the type of wavefunction has changed
    if(wfChanged && WFType != null){
        $(".cover").hide();

        // Clear scene
        clearScene(main_scene);

        // Draw correct wavefunction
        eval("draw_" + WFType + "(main_scene);");

        wfChanged = false;
    }
}

function render(){
    // Render main scene
    renderer.render(main_scene, camera);
}

function animate(){
    requestAnimationFrame(animate);

    // Update controls.
    controls.update();

    // Run update and render
    update();
    render();
}

function clearScene(scene){
    while(scene.children.length > 0)
        scene.remove(scene.children[0]);
}

// Drawing function for null scene
function drawNullScene(scene){}

// Axes drawing functions for 1D and 3D wavefunctions
var L1D = 2;
function draw1DAxes(scene){
    $("#WF_ON").show();
    $("#PROB_ON").show();

    // Set camera position for 1D axes
    camera.position.set(0, 0, 3);
    camera.rotation.set(0, 0, 0);
    controls.update();

    // Create axes materials
    var x_line_mat = new THREE.LineBasicMaterial({color: "#0000ff", linewidth: 3});
    var y_line_mat = new THREE.LineBasicMaterial({color: "#ff0000", linewidth: 3});

    // Create x-axis line geometry
    var x_line_geo = new THREE.Geometry();
    x_line_geo.vertices.push(new THREE.Vector3(-L1D/2 - .5, 0, 0));
    x_line_geo.vertices.push(new THREE.Vector3(L1D/2 + .5, 0, 0));
    var x_line = new THREE.Line(x_line_geo, x_line_mat);
    scene.add(x_line);

    // Create left y-axis line geometry
    var y_line_left_geo = new THREE.Geometry();
    y_line_left_geo.vertices.push(new THREE.Vector3(-L1D/2, 0, 0));
    y_line_left_geo.vertices.push(new THREE.Vector3(-L1D/2, 10, 0));
    var y_line_left = new THREE.Line(y_line_left_geo, y_line_mat);
    scene.add(y_line_left);

    // Create right y-axis line geometry
    var y_line_right_geo = new THREE.Geometry();
    y_line_right_geo.vertices.push(new THREE.Vector3(L1D/2, 0, 0));
    y_line_right_geo.vertices.push(new THREE.Vector3(L1D/2, 10, 0));
    var y_line_right = new THREE.Line(y_line_right_geo, y_line_mat);
    scene.add(y_line_right);

    // Add GridHelper
    var grid_helper = new THREE.GridHelper(20, 50, 0xffffff, 0xffffff);
    grid_helper.material.transparent = true;
    grid_helper.material.opacity = .1;
    grid_helper.rotation.x = Math.PI/2;
    scene.add(grid_helper);
}

var L3D = 2;
function draw3DAxes(scene){
    $("#WF_ON").hide();
    $("#PROB_ON").hide();

    // Set camera position for 3D axes
    camera.position.set(3, 3, 3);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    controls.update();

    // Create axes materials
    var axis_mat = new THREE.LineBasicMaterial({color: "#ffffff", opacity: .4, transparent: true});

    // Create x-axis line geometry
    var x_line_geo = new THREE.Geometry();
    x_line_geo.vertices.push(new THREE.Vector3(-10, 0, 0));
    x_line_geo.vertices.push(new THREE.Vector3(10, 0, 0));
    var x_line = new THREE.Line(x_line_geo, axis_mat);
    scene.add(x_line);

    // Create y-axis line geometry
    var y_line_geo = new THREE.Geometry();
    y_line_geo.vertices.push(new THREE.Vector3(0, -10, 0));
    y_line_geo.vertices.push(new THREE.Vector3(0, 10, 0));
    var y_line = new THREE.Line(y_line_geo, axis_mat);
    scene.add(y_line);

    // Create z-axis line geometry
    var z_line_geo = new THREE.Geometry();
    z_line_geo.vertices.push(new THREE.Vector3(0, 0, -10));
    z_line_geo.vertices.push(new THREE.Vector3(0, 0, 10));
    var z_line = new THREE.Line(z_line_geo, axis_mat);
    scene.add(z_line);

    // Add GridHelper
    var grid_helper = new THREE.GridHelper(20, 50, 0xffffff, 0xffffff);
    grid_helper.material.transparent = true;
    grid_helper.material.opacity = .1;
    scene.add(grid_helper);
}

// Drawing functions for the respective wavefunction types
var accuracy = .01;
var accuracy3D = .1;
function draw_1D_INF_WELL(scene){
    // Draw the axes for the 1D wavefunctions
    draw1DAxes(main_scene);

    var wf = function(x){
        var A = Math.sqrt(2 / L1D);
        var n = WF_VARS.get("1D_INF_WELL_n");
        return A * Math.sin( (n * Math.PI * (x + L1D/2)) / L1D );
    };

    // If wavefunction is on, draw it
    if(display_wf){
        var wf_line_geo = new THREE.Geometry();
        var wf_line_mat = new THREE.LineBasicMaterial({color: "#00ff00", linewidth: 3});
        for(var x = -L1D/2; x <= L1D/2 + .001; x += accuracy){
            wf_line_geo.vertices.push(new THREE.Vector3(x, wf(x), 0));
        }
        var wf_line = new THREE.Line(wf_line_geo, wf_line_mat);
        scene.add(wf_line);
    }

    // If probability distribution is on, draw it
    if(display_prob){
        var prob_line_geo = new THREE.Geometry();
        var prob_line_mat = new THREE.LineBasicMaterial({color: "#ffff00", linewidth: 3});
        for(var x = -L1D/2; x <= L1D/2 + .001; x += accuracy){
            prob_line_geo.vertices.push(new THREE.Vector3(x, Math.pow(wf(x),2), 0));
        }
        var prob_line = new THREE.Line(prob_line_geo, prob_line_mat);
        scene.add(prob_line);
    }
}

function draw_1D_FIN_WELL(scene){
    // Draw the axes for the 1D wavefunctions
    draw1DAxes(main_scene);
}

function draw_1D_SHO(scene){
    // Draw the axes for the 1D wavefunctions
    draw1DAxes(main_scene);
}

function draw_3D_BOX(scene){
    // Draw the axes for the 3D wavefunctions
    draw3DAxes(main_scene);

    // Draw the frame of the area
    var frame_geo = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(L3D, L3D, L3D));
    var frame_mat = new THREE.LineBasicMaterial({color: "#ffffff", opacity: .4, transparent: true});
    var frame = new THREE.LineSegments(frame_geo, frame_mat);
    scene.add(frame);

    // Get values of n from the user input
    var nx = WF_VARS.get("3D_BOX_nx");
    var ny = WF_VARS.get("3D_BOX_ny");
    var nz = WF_VARS.get("3D_BOX_nz");

    // Calculate the value for A in the wavefunnction
    var A = Math.pow(L3D, 3/2);

    var prob = function(x, y, z, nx, ny, nz){
        var X = Math.sin((nx * Math.PI * x) / L3D);
        var Y = Math.sin((ny * Math.PI * y) / L3D);
        var Z = Math.sin((nz * Math.PI * z) / L3D);
        return Math.pow(Math.abs(A * X * Y * Z), 2);
    }

    // Create image loader to load particle texture
    var imgLoader = new THREE.TextureLoader;

    for(var x = 0; x <= L3D; x += accuracy3D){
        for(var y = 0; y <= L3D; y += accuracy3D){
            for(var z = 0; z <= L3D; z += accuracy3D){
                // Calculate value of probability density at (x, y, z)
                var p = prob(x, y, z, nx, ny, nz);

                // Create reduced probability density to be used for opacity
                var p_mod = Math.pow(p, 5/2);
                
                // Load point position into geometry
                var point = new THREE.Geometry();
                var point_pos = new THREE.Vector3(x - L3D/2, y - L3D/2, z - L3D/2);
                point.vertices.push(point_pos);

                var pointMaterial = new THREE.PointsMaterial({
                    color: 0x7aedff,
                    size: L3D/8,
                    opacity: p_mod,
                    transparent: true,
                    depthTest: false,
                    map: imgLoader.load("./img/particle.png"),
                    blending: THREE.AdditiveBlending,
                });

                // Add point to scene
                var pointFinal = new THREE.Points(point, pointMaterial);
                scene.add(pointFinal);

            }
        }
    }

}

function draw_3D_SHO(scene){
    draw3DAxes(main_scene);
}

// Helper function to take derivatives of higher powers
function diffN(expression, i_var, power){
    var e = expression;
    for(var i = 0; i < power; i++){
        e = math.derivative(e, i_var).toString();
    }
    return e;
}

// Helper function that returns a Legendre Polynomial
function legendrePoly(l){
    var a = Math.pow(-1, l) / (Math.pow(2, l) * math.factorial(l));
    var b = diffN('(1-(x^2))^' + l.toString(), 'x', l);
    return "(" + b + ") * " + a.toString();
}

// Helper function that returns an Associated Legendre Polynomial
function assocLegendrePoly(l, m){
    var a = Math.pow(-1, m);
    var b = 'sqrt((1-(x^2)) ^ ' + m.toString() + ')';
    var c = diffN(legendrePoly(l, 'x'), 'x', m);
    return "(" + c + ") * " + a.toString() + " * " + b;
}

// Helper function that returns a Lageurre Polynomial
function laguerrePoly(j){
    var a = '(e^x)';
    var b = diffN('(e^(-x)) * x^' + j.toString(), 'x', j);
    return "(" + b + ") * " + a;
}

// Helper function that returns an Associated Lageurre Polynomial
function assocLaguerrePoly(k, j){
    var a = Math.pow(-1, k);
    var b = diffN(laguerrePoly(j + k), 'x', k);
    return "(" + b + ") * " + a;
}

function testLaguerrePoly(k, j){
    console.time("laguerre_test");
    let scope = {x:1};
    console.log(math.eval(assocLaguerrePoly(k, j), scope));
    console.timeEnd("laguerre_test");
}

function draw_3D_R(scene){
    // draw3DAxes(main_scene);

    // Get values of n, l and m from the user input
    var n = WF_VARS.get("3D_R_n");
    var l = WF_VARS.get("3D_R_l");
    var m = WF_VARS.get("3D_R_m");

}