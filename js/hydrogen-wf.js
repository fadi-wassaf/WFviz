var rad_accuracy = .1;
// var angular_accuracy = Math.PI/16;
var angular_accuracy = Math.PI/32;
var R3D = 1;
var rad_0 = .1;
function draw_3D_H(scene){

    // Draw the 3D axes for the scene
    draw3DAxes(main_scene);

    // Draw a spherical frame that will house the probability density


    // Get values from the user input
    // n = 1, 2, 3, ...
    // m = -l, ..., l
    // l = 0, 1, 2, ... , n - 1     
    var n = WF_VARS.get("3D_H_n");
    var m = WF_VARS.get("3D_H_m");
    var l = WF_VARS.get("3D_H_l");

    console.log("n: " + n);
    console.log("m: " + m);
    console.log("l: " + l);

    // Get the Associated Laguerre Polynomial based on n and l
    var laguerre = Algebrite.laguerre('x', n - l - 1, (2 * l) + 1);

    // Get the Associated Legendre Polynomial based on m and l
    // var legendre = Algebrite.legendre('x', l, m);
    var legendre = Algebrite.legendre('cos(x)', l, Math.abs(m));

    // Get constant ahead of the wavefunction
    var A = Math.sqrt( Math.pow(2/(n * rad_0), 3) * (( fact(n - l - 1) ) / ( 2 * n * fact(n + l) )) );

    // Get constant in the spherical harmonic
    var B = Math.pow(-1, m) * Math.sqrt( ( ((2*l) + 1) * fact(l - m) ) / ( (4 * Math.PI) * fact(l + m)) );

    // Create image loader to load particle texture
    var imgLoader = new THREE.TextureLoader;

    // Like 3D Box
    // Loop through the spherical volume and generate the probability density
    // for(var r = 0; r <= R3D; r += rad_accuracy){
    //     for(var t = 0; t <= 2 * Math.PI; t += angular_accuracy){
    //         for(var p = 0; p <= Math.PI/2; p += angular_accuracy){

    //             var laguerre_eval = parseFloat( Algebrite.eval(laguerre, 'x', (2 * r)/(n * rad_0)) );
    //             // console.log(laguerre_eval);

    //             // var legendre_eval = parseFloat( Algebrite.eval(legendre, 'x', Math.cos(t)) );
    //             var legendre_eval = parseFloat( Algebrite.eval(legendre, 'x', t) );

    //             // // var sph_harmonic_im_squared = Algebrite.eval('exp(i * m * p)');
    //             var sph_harmonic = B * legendre_eval;

    //             var wf_val = A * Math.exp(-r/(n * rad_0)) * Math.pow((2 * r)/(n * rad_0), l) * laguerre_eval * sph_harmonic;
    //             // console.log(wf_val);
    //             var prob = Math.pow(wf_val, 2);
    //             console.log(r + " " + prob);

    //             // // If the probability is above a certain threshold, draw the sprite
    //             if(prob > .075){
                    
    //                 // Create the color based on the probability of the point
    //                 // var probColor = new THREE.Color(1, 1, 1).setHSL(Math.pow(prob,1), 1, .5);
    //                 var probColor = new THREE.Color(1, 1, 1).setHSL(0, 1, .5+(prob/2));
                    
    //                 // Create the sprite with the correct color and opcity
    //                 var spriteMaterial = new THREE.SpriteMaterial({
    //                     color: probColor,
    //                     opacity: prob,
    //                     transparent: true,
    //                     depthTest: false,
    //                     map: imgLoader.load("./imgs/particle.png"),
    //                 });

    //                 // Add sprite to scene
    //                 var spriteFinal = new THREE.Sprite(spriteMaterial);
    //                 spriteFinal.scale.set(.2, .2, .2);
    //                 spriteFinal.translateX(r * Math.sin(t) * Math.sin(p));
    //                 spriteFinal.translateY(r * Math.cos(p));
    //                 spriteFinal.translateZ(r * Math.cos(t) * Math.sin(p));
    //                 scene.add(spriteFinal);
    //             }

    //         }
    //     }
    // }

    // Monte Carlo with points?
    // Loop through the spherical volume and generate the probability density

    var wf_pos_points = new THREE.Geometry();
    var wf_neg_points = new THREE.Geometry();

    var point_num = 10000;
    var rand_r = [], rand_t = [], rand_p = [];
    for(var i = 0; i < point_num; i++){
        var r = getBoundedRand(0, 2);
        var t = getBoundedRand(0, 2 * Math.PI);
        var p = getBoundedRand(0, Math.PI);

        var laguerre_eval = parseFloat( Algebrite.eval(laguerre, 'x', (2 * r)/(n * rad_0)) );
        // console.log(laguerre_eval);

        // var legendre_eval = parseFloat( Algebrite.eval(legendre, 'x', Math.cos(t)) );
        var legendre_eval = parseFloat( Algebrite.eval(legendre, 'x', t) );

        // // var sph_harmonic_im_squared = Algebrite.eval('exp(i * m * p)');
        var sph_harmonic = B * legendre_eval;

        var wf_val = A * Math.exp(-r/(n * rad_0)) * Math.pow((2 * r)/(n * rad_0), l) * laguerre_eval * sph_harmonic;
        // console.log(wf_val);
        var prob = Math.pow(wf_val, 2);
        // console.log(r + " " + prob);

        // // If the probability is above a certain threshold, draw the sprite
        // if(prob > .075){
        if(prob > .65){
            
            // Create the color based on the probability of the point
            // var probColor = new THREE.Color(1, 1, 1).setHSL(Math.pow(prob,1), 1, .5);
            var probColor = new THREE.Color(1, 1, 1).setHSL(0, 1, .5+(prob/2));
            
            // Create the sprite with the correct color and opcity
            var pointMaterial = new THREE.PointsMaterial({
                color: probColor,
                opacity: prob,
                transparent: true,
                depthTest: false,
            });

            // Add point

            if(wf_val > 0){
                wf_pos_points.vertices.push(new THREE.Vector3(
                    r * Math.sin(t) * Math.sin(p),
                    r * Math.cos(p),
                    r * Math.cos(t) * Math.sin(p)
                ));
            } else {
                wf_neg_points.vertices.push(new THREE.Vector3(
                    r * Math.sin(t) * Math.sin(p),
                    r * Math.cos(p),
                    r * Math.cos(t) * Math.sin(p)
                ));
            }
            
        }

    }

    var posMat= new THREE.PointsMaterial( { color: 0xff0000, size: .03} );
    var negMat = new THREE.PointsMaterial( { color: 0x0000ff, size: .03} );
    var pospoints = new THREE.Points(wf_pos_points, posMat);
    var negpoints = new THREE.Points(wf_neg_points, negMat);
    scene.add(pospoints);
    scene.add(negpoints);

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