var rad_accuracy = .1;
// var angular_accuracy = Math.PI/16;
var angular_accuracy = Math.PI/32;
var R3D = 1;
var rad_0 = .1;

function draw_3D_H(scene){

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
    console.log(WF_H.legendre_str);

    var decimalRegex = /\d+[.]*\d*/gm;
    var addDecimalPoints = function(str){
        if(str.includes('.')){
            return str; 
        } else {
            return str + '.';
        }	
    }; 

    // Some stackoverflow code from 
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

    WF_H.laguerre_str = caretReplace(WF_H.laguerre_str);
    WF_H.legendre_str = caretReplace(WF_H.legendre_str);
    WF_H.laguerre_str = WF_H.laguerre_str.replace(decimalRegex, addDecimalPoints);
    WF_H.legendre_str = WF_H.legendre_str.replace(decimalRegex, addDecimalPoints);
    // WF_H.laguerre_str = WF_H.laguerre_str.replace(powRegex, addPow);
    // WF_H.legendre_str = WF_H.legendre_str.replace(powRegex, addPow);

    // Radial and Spherical Harmonic Coefficients
    WF_H.A = Math.sqrt( Math.pow(2/(WF_H.n * WF_H.rad), 3) * (( fact(WF_H.n - WF_H.l - 1) ) / ( 2 * WF_H.n * fact(WF_H.n + WF_H.l) )) );
    WF_H.B = Math.pow(-1, WF_H.m) * Math.sqrt( ( ((2*WF_H.l) + 1) * fact(WF_H.l - Math.abs(WF_H.m)) ) / ( (4 * Math.PI) * fact(WF_H.l + Math.abs(WF_H.m))) );

    console.log(WF_H);

    console.timeEnd('Pre-gen');
    console.time("3setRand");


    console.timeEnd("3setRand");

    console.time("Calculation");

    // For n = 1 through 8, use from the following preset values 
    var pointsTested = [ 1e4, 1e4, 2e4, 3e4, 3.5e4, 3.5e4, 3.5e4, 4.5e4 ];
    var radiusTested = [ 2, 2, 4, 6, 8, 8, 10, 12 ];
    var avgFactorList = [ 1, 1, 1, .75, .5, .3, .3, .25 ];
    var pointScaleList = [ .03, .03, .03, .03, .03, .03, .03, .05 ];
    var avgFactor = avgFactorList[WF_H.n - 1];
    var point_num = pointsTested[WF_H.n - 1];
    var pointScale = pointScaleList[WF_H.n - 1];
    console.log("avgFact: " + avgFactor);

    if(turbojs){
        var randRTPP = turbojs.alloc(point_num * 4);
        for(var i = 0; i < point_num * 4; i += 4){
            // randRTPP.data[i] = getBoundedRand(0, 2); 
            randRTPP.data[i] = getBoundedRand(0, radiusTested[WF_H.n - 1]); 
            randRTPP.data[i + 1] = getBoundedRand(0, Math.PI);
            randRTPP.data[i + 2] = getBoundedRand(0, 2 * Math.PI);
            randRTPP.data[i + 3] = 0;
        }

        turbojs.run(randRTPP, `void main(void){
            vec4 rtpp = read();

            float r = rtpp.r;
            float t = rtpp.g;
            float p = rtpp.b;

            float x = (2. * r) / (float(${WF_H.n}) * float(${rad_0}));
            float laguerre_eval = float(` + WF_H.laguerre_str + `);

            x = t;
            float legendre_eval = float(` + WF_H.legendre_str + `);

            // REAL
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

        var subarr = randRTPP.data.subarray(0, point_num * 4);
        var avg = 0;
        for(var i = 0; i < point_num * 4; i += 4){
            avg += Math.abs(subarr[i + 3]);
        }
        avg /= point_num;
        avg *= avgFactor;

        if(WF_H.m == 0 && WF_H.l == 0) { 
            avg /= WF_H.n * Math.sqrt(2); 
        } else if(WF_H.m == 0 && WF_H.l !=0){
            avg /= Math.sqrt(2);
        }
        console.log(avg);


        console.log(randRTPP.data);

        var data = randRTPP.data.subarray(0, point_num*4);

        var pos_wf_pts = new THREE.Geometry();
        var neg_wf_pts = new THREE.Geometry();

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

        var pos_mat = new THREE.PointsMaterial( {color: 0xff0000, size: pointScale} ); //.03
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