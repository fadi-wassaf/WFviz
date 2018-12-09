var rad_accuracy = .1;
var angular_accuracy = Math.PI/16;
var R3D = 1;
function draw_H_RAD(scene){

    // Draw the 3D axes for the scene
    // draw3DAxes(main_scene);

    // Draw a spherical frame that will house the probability density


    // Get values from the user input
    var n = WF_VARS.get("3D_H_n");
    var m = WF_VARS.get("3D_H_m");
    var l = WF_VARS.get("3D_H_l");

    // Get the Associated Laguerre Polynomial based on n and l
    var laguerre = Algebrite.laguerre('x', n - l - 1, (2 * l) + 1);

    // Get the Associated Legendre Polynomial based on m and l
    var legendre = Algebrite.legendre('x', l, m);

    // Get constant ahead of the wavefunction
    var A = Math.sqrt( Math.pow(2/(n * R3D), 3) * ( fact(n - l - 1) ) / ( 2 * n * fact(n + l) ) );
    
    // Get constant in the spherical harmonic
    var B = Math.pow(-1, m) * Math.sqrt( ( ((2*l) + 1) * fact(l - m) ) / ( (4 * Math.PI) * fact(l + m)) );

    // Create image loader to load particle texture
    var imgLoader = new THREE.TextureLoader;

    // Loop through the spherical volume and generate the probability density
    // Currently 308 points
    for(var r = 0; r <= R3D; r += rad_accuracy){
        for(var t = 0; t <= 2 * Math.PI; t++){
            for(var p = 0; p <= Math.PI; p++){

                var laguerre_eval = Algebrite.eval(laguerre, 'x', (2 * r)/(n * R3D));
                var legendre_eval = Algebrite.eval(legendre, 'x', Math.cos(t));

                // var wf_val = A * Math.exp(-r/(n * R3D)) * Math.pow(, 2);

            }
        }
    }

}

function fact(num) {
  if (num < 0) 
        return -1;
  else if (num == 0) 
      return 1;
  else {
      return (num * fact(num - 1));
  }
}