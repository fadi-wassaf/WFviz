
// Axes drawing functions for 1D and 3D wavefunctions
var L1D = 2;
function draw1DAxes(scene){
    // $("#WF_ON").show();
    // $("#PROB_ON").show();
    $("#1D_TOGGLES").show();
    $("#3D_TOGGLES").hide();

    controls.enabled = false;

    // Set camera position for 1D axes
    camera.position.set(0, 0, 2);
    camera.rotation.set(0, 0, 0);
    controls.update();

    // Create axes materials
    var x_line_mat = new THREE.LineBasicMaterial({color: "#0000ff", linewidth: 3});

    // Create x-axis line geometry
    var x_line_geo = new THREE.Geometry();
    x_line_geo.vertices.push(new THREE.Vector3(-5, 0, 0));
    x_line_geo.vertices.push(new THREE.Vector3(5, 0, 0));
    var x_line = new THREE.Line(x_line_geo, x_line_mat);
    scene.add(x_line);

    // Add GridHelper
    var grid_helper = new THREE.GridHelper(20, 50, 0xffffff, 0xffffff);
    grid_helper.material.transparent = true;
    grid_helper.material.opacity = .1;
    grid_helper.rotation.x = Math.PI/2;
    scene.add(grid_helper);
}

var L3D = 2;
function draw3DAxes(scene){
    // $("#WF_ON").hide();
    // $("#PROB_ON").hide();
    $("#1D_TOGGLES").hide();

    controls.enabled = true;

    // Set camera position for 3D axes
    camera.position.set(3, 3, 3);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    controls.update();

    // Create axes materials
    var axis_mat = new THREE.LineBasicMaterial({color: "#ffffff", opacity: .4, transparent: true});

    // Create x-axis line geometry
    var x_line_geo = new THREE.Geometry();
    x_line_geo.vertices.push(new THREE.Vector3(-15, 0, 0));
    x_line_geo.vertices.push(new THREE.Vector3(15, 0, 0));
    var x_line = new THREE.Line(x_line_geo, axis_mat);
    scene.add(x_line);

    // Create y-axis line geometry
    var y_line_geo = new THREE.Geometry();
    y_line_geo.vertices.push(new THREE.Vector3(0, -15, 0));
    y_line_geo.vertices.push(new THREE.Vector3(0, 15, 0));
    var y_line = new THREE.Line(y_line_geo, axis_mat);
    scene.add(y_line);

    // Create z-axis line geometry
    var z_line_geo = new THREE.Geometry();
    z_line_geo.vertices.push(new THREE.Vector3(0, 0, -15));
    z_line_geo.vertices.push(new THREE.Vector3(0, 0, 15));
    var z_line = new THREE.Line(z_line_geo, axis_mat);
    scene.add(z_line);

    // Add GridHelper
    var grid_helper = new THREE.GridHelper(30, 50, 0xffffff, 0xffffff);
    grid_helper.material.transparent = true;
    grid_helper.material.opacity = .1;
    scene.add(grid_helper);

    // Add Axes Helper
    var axesHelper = new THREE.AxesHelper(15);
    scene.add(axesHelper);
}

// Drawing functions for the respective wavefunction types


function draw_1D_INF_WELL(scene){
    var accuracy = .01;

    // Draw the axes for the 1D wavefunctions
    draw1DAxes(main_scene);

    // Create boundary line material
    var y_line_mat = new THREE.LineBasicMaterial({color: "#ff0000", linewidth: 3});

    // Create left y-axis boundary
    var y_line_left_geo = new THREE.Geometry();
    y_line_left_geo.vertices.push(new THREE.Vector3(-L1D/2, 0, 0));
    y_line_left_geo.vertices.push(new THREE.Vector3(-L1D/2, 10, 0));
    var y_line_left = new THREE.Line(y_line_left_geo, y_line_mat);
    scene.add(y_line_left);

    // Create right y-axis boundary
    var y_line_right_geo = new THREE.Geometry();
    y_line_right_geo.vertices.push(new THREE.Vector3(L1D/2, 0, 0));
    y_line_right_geo.vertices.push(new THREE.Vector3(L1D/2, 10, 0));
    var y_line_right = new THREE.Line(y_line_right_geo, y_line_mat);
    scene.add(y_line_right);
    
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

// Uses accuracy from before
function draw_1D_HO(scene){

    var accuracy = .01;

    // Draw the axes for the 1D wavefunctions
    draw1DAxes(main_scene);

    // Create center line
    var y_line_mat = new THREE.LineBasicMaterial({color: "#ff0000", linewidth: 3});

    // Create left y-axis boundary
    var y_line_left_geo = new THREE.Geometry();
    y_line_left_geo.vertices.push(new THREE.Vector3(0, 0, 0));
    y_line_left_geo.vertices.push(new THREE.Vector3(0, 10, 0));
    var y_line_left = new THREE.Line(y_line_left_geo, y_line_mat);
    scene.add(y_line_left);

    // Get variables from the input panel
    var n = WF_VARS.get("1D_HO_n");
    var a = WF_VARS.get("1D_HO_a");

    // Setup Hermite Polynomial for use
    var hermite = Algebrite.hermite('x', n);

    var wf = function(x){
        // Change x based on value of alpha
        var y = Math.sqrt(a) * x;

        // Get value of hermite at y
        var herm_eval = parseFloat(Algebrite.eval(hermite, 'x', y));

        // Get coefficient of wf
        var A = Math.pow(a/Math.PI, 1/4) * ( 1 / Math.sqrt( Math.pow(2, n) * fact(n) ) );

        return A * herm_eval * Math.exp( - Math.pow(y, 2) / 2 );
    };

    // If wavefunction is on, draw it
    if(display_wf){
        var wf_line_geo = new THREE.Geometry();
        var wf_line_mat = new THREE.LineBasicMaterial({color: "#00ff00", linewidth: 3});
        for(var x = -2*L1D; x <= 2*L1D + .001; x += accuracy){
            wf_line_geo.vertices.push(new THREE.Vector3(x, wf(x), 0));
        }
        var wf_line = new THREE.Line(wf_line_geo, wf_line_mat);
        scene.add(wf_line);
    }

    // If probability distribution is on, draw it
    if(display_prob){
        var prob_line_geo = new THREE.Geometry();
        var prob_line_mat = new THREE.LineBasicMaterial({color: "#ffff00", linewidth: 3});
        for(var x = -2*L1D; x <= 2*L1D + .001; x += accuracy){
            prob_line_geo.vertices.push(new THREE.Vector3(x, Math.pow(wf(x),2), 0));
        }
        var prob_line = new THREE.Line(prob_line_geo, prob_line_mat);
        scene.add(prob_line);
    }

}

var splitXY = 1, splitXZ = 1, splitYZ = 1;
function draw_3D_BOX(scene){

    $("#3D_TOGGLES").show();

    var accuracy3D = .1;

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
    var A = Math.sqrt(8 / Math.pow(L3D, 3));

    var prob = function(x, y, z, nx, ny, nz){
        var X = Math.sin((nx * Math.PI * x) / L3D);
        var Y = Math.sin((ny * Math.PI * y) / L3D);
        var Z = Math.sin((nz * Math.PI * z) / L3D);
        return Math.pow(Math.abs(A * X * Y * Z), 2);
    }

    // Create image loader to load particle texture
    var imgLoader = new THREE.TextureLoader;
    
    // Loop through the points in the region and generate probability density
    for(var x = 0; x <= L3D/splitYZ; x += accuracy3D){
        for(var y = 0; y <= L3D/splitXZ; y += accuracy3D){
            for(var z = 0; z <= L3D/splitXY; z += accuracy3D){
                // Calculate value of probability density at (x, y, z)
                var p = prob(x, y, z, nx, ny, nz);

                // If the probability is above a certain threshold, draw the sprite
                if(p > .075){
                    
                    // Create the color based on the probability of the point
                    var probColor = new THREE.Color(1, 1, 1).setHSL(p, 1, .5);
                    
                    // Create the sprite with the correct color and opcity
                    var spriteMaterial = new THREE.SpriteMaterial({
                        color: probColor,
                        opacity: p,
                        transparent: true,
                        depthTest: false,
                        map: imgLoader.load("./imgs/particle.png"),
                    });

                    // Add sprite to scene
                    var spriteFinal = new THREE.Sprite(spriteMaterial);
                    spriteFinal.scale.set(.2, .2, .2);
                    spriteFinal.translateX(x - L3D/2);
                    spriteFinal.translateY(y - L3D/2);
                    spriteFinal.translateZ(z - L3D/2);
                    scene.add(spriteFinal);
                }

            }
        }
    }

}

function draw_3D_H(scene){

    var rad_0 = .1;

    console.time('Pre-gen');

    draw3DAxes(main_scene);

    // Get values from the user input
    // n = 1, 2, 3, ...
    // l = 0, 1, 2, ... , n - 1    
    // m = -l, ..., l
    var n_in = WF_VARS.get("3D_H_n");
    var m_in = WF_VARS.get("3D_H_m");
    var l_in = WF_VARS.get("3D_H_l");
    
    const WF_H = {};

    // Quantum Numbers
    WF_H.n = n_in;
    WF_H.m = m_in;
    WF_H.l = l_in;
    WF_H.rad = rad_0;

    // Generate laguerre and legendre functions
    WF_H.laguerre = Algebrite.laguerre('x', WF_H.n - WF_H.l - 1, (2 * WF_H.l) + 1);
    WF_H.legendre = Algebrite.legendre('cos(x)', WF_H.l, Math.abs(WF_H.m));
    WF_H.laguerre_str = WF_H.laguerre.toString();
    WF_H.legendre_str = WF_H.legendre.toString();
    // console.log(WF_H.legendre_str);

    var decimalRegex = /\d+[.]*\d*/gm;
    var addDecimalPoints = function(str){
        if(str.includes('.')){
            return str; 
        } else {
            return str + '.';
        }	
    }; 

    // Some stackoverflow code from used to replace carets with pow(a,b)
    // https://stackoverflow.com/questions/4901490/rewrite-formula-string-to-replace-ab-with-math-powa-b
    var caretReplace = function(_s) {
        if (_s.indexOf("^") > -1) {
            var tab = [];
            var powfunc="pow";
            var joker = "___joker___";
            while (_s.indexOf("(") > -1) {
                _s = _s.replace(/(\([^\(\)]*\))/g, function(m, t) {
                    tab.push(t);
                    return (joker + (tab.length - 1));
                });
            }
    
            tab.push(_s);
            _s = joker + (tab.length - 1);
            while (_s.indexOf(joker) > -1) {
                _s = _s.replace(new RegExp(joker + "(\\d+)", "g"), function(m, d) {
                    return tab[d].replace(/(\w*)\^(\w*)/g, powfunc+"($1,$2)");
                });
            }
        }
        return _s;
    };

    // Change laguerre and legendre poly strings so that they are in a GLSL compatible form
    WF_H.laguerre_str = caretReplace(WF_H.laguerre_str);
    WF_H.legendre_str = caretReplace(WF_H.legendre_str);
    WF_H.laguerre_str = WF_H.laguerre_str.replace(decimalRegex, addDecimalPoints);
    WF_H.legendre_str = WF_H.legendre_str.replace(decimalRegex, addDecimalPoints);

    // Radial and Spherical Harmonic Coefficients
    WF_H.A = Math.sqrt( Math.pow(2/(WF_H.n * WF_H.rad), 3) * (( fact(WF_H.n - WF_H.l - 1) ) / ( 2 * WF_H.n * fact(WF_H.n + WF_H.l) )) );
    WF_H.B = Math.pow(-1, WF_H.m) * Math.sqrt( ( ((2*WF_H.l) + 1) * fact(WF_H.l - Math.abs(WF_H.m)) ) / ( (4 * Math.PI) * fact(WF_H.l + Math.abs(WF_H.m))) );

    // console.log(WF_H);

    console.timeEnd('Pre-gen');

    console.time("Calculation");

    // For n = 1 through 8, use from the following preset values 
    var pointsTested = [ 1e4, 1e4, 2e4, 3e4, 3.5e4, 3.5e4, 3.5e4, 4.5e4 ];
    var radiusTested = [ 2, 2, 4, 6, 8, 8, 10, 12 ];
    var avgFactorList = [ .25, 1, 1, .75, .5, .3, .3, .25 ];
    var pointScaleList = [ .03, .03, .03, .03, .04, .045, .05, .06 ];
    var zoomLevel = [ 2, 2, 2.5, 3.5, 5, 6.5, 10, 12 ];
    var avgFactor = avgFactorList[WF_H.n - 1];
    var point_num = pointsTested[WF_H.n - 1];
    var pointScale = pointScaleList[WF_H.n - 1];
    var zoomCoord = zoomLevel[WF_H.n - 1];

    // Set camera position based on preset value
    camera.position.set(zoomCoord, zoomCoord, zoomCoord);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    controls.update();

    if(turbojs){
        // Allocate the turbojs data array that will hold the probability density of the wavefunction
        var randRTPP = turbojs.alloc(point_num * 4);
        for(var i = 0; i < point_num * 4; i += 4){
            // These 4 data points correspond to Radius, Theta, Phi, and the Probability at that point
            randRTPP.data[i] = getBoundedRand(0, radiusTested[WF_H.n - 1]); 
            randRTPP.data[i + 1] = getBoundedRand(0, Math.PI);
            randRTPP.data[i + 2] = getBoundedRand(0, 2 * Math.PI);
            randRTPP.data[i + 3] = 0;
        }

        // Calculate the probabilities at each point
        turbojs.run(randRTPP, `void main(void){
            vec4 rtpp = read();

            float r = rtpp.r;
            float t = rtpp.g;
            float p = rtpp.b;

            float x = (2. * r) / (float(${WF_H.n}) * float(${rad_0}));
            float laguerre_eval = float(` + WF_H.laguerre_str + `);

            x = t;
            float legendre_eval = float(` + WF_H.legendre_str + `);

            // REAL PART
            float sph_harmonic = float(${WF_H.B}) * legendre_eval;
            if(${WF_H.m} > 0){
                sph_harmonic *= cos(float(${WF_H.m}) * p) * sqrt(2.);
            } else if(${WF_H.m} < 0){
                sph_harmonic *= sin(-float(${WF_H.m}) * p) * sqrt(2.);
            }

            x = (2. * r) / (float(${WF_H.n}) * float(${rad_0}));
            float wf_val = float(${WF_H.A}) * exp(-r/(float(${WF_H.n}) * float(${rad_0}) ) );
            wf_val *= pow(x, float(${WF_H.l})) * laguerre_eval * sph_harmonic;

            float prob = sign(wf_val) * pow(wf_val, 2.);

            // commit(vec4(rtpp.rgb, prob));
            commit(vec4(
                r * sin(p) * sin(t),
                r * cos(t),
                r * cos(p) * sin(t),
                prob
            ));

        }`);

        // Get the average probability through the whole space.
        // Used for choosing what points to show.
        var subarr = randRTPP.data.subarray(0, point_num * 4);
        var avg = 0;
        for(var i = 0; i < point_num * 4; i += 4){
            avg += Math.abs(subarr[i + 3]);
        }
        avg /= point_num;
        avg *= avgFactor;

        // Apply reduction factor based on value of n
        if(WF_H.m == 0 && WF_H.l == 0) { 
            avg /= WF_H.n * Math.sqrt(2); 
        } else if(WF_H.m == 0 && WF_H.l !=0){
            avg /= Math.sqrt(2);
        }
        // console.log(avg);

        // console.log(randRTPP.data);

        // Pull the data from the turbojs array
        var data = randRTPP.data.subarray(0, point_num*4);

        var pos_wf_pts = new THREE.Geometry();
        var neg_wf_pts = new THREE.Geometry();

        // Go through data and draw the points that are above the weighted average probability
        var num_drawn = 0;
        for(var i = 0; i < point_num * 4; i += 4){

            if(Math.abs(data[i + 3]) > avg){
                if(data[i + 3] > 0){
                    pos_wf_pts.vertices.push(
                        new THREE.Vector3(data[i], data[i + 1], data[i + 2])
                    );
                } else {
                    neg_wf_pts.vertices.push(
                        new THREE.Vector3(data[i], data[i + 1], data[i + 2])
                    );
                }
                num_drawn++;
            }

        }
        console.log("Drawn: " + num_drawn);

        // Add the points to the scene
        var pos_mat = new THREE.PointsMaterial( {color: 0xff0000, size: pointScale} );
        var neg_mat = new THREE.PointsMaterial( {color: 0x0000ff, size: pointScale} );
        var pos_pts = new THREE.Points(pos_wf_pts, pos_mat);
        var neg_pts = new THREE.Points(neg_wf_pts, neg_mat);
        scene.add(pos_pts);  
        scene.add(neg_pts);        

    }

    console.timeEnd("Calculation");

}

function fact(num) {
    if (num < 0) {
        return num * fact(num + 1);
    } else if (num == 0) {
        return 1;
    } else {
        return num * fact(num - 1);
    }
}

// Function that can get a random value in a bounded domain
function getBoundedRand(min, max){
    return Math.random() * (max - min) + min;
};