var WFType = "1D_INF_WELL";
var display_wf = true, display_prob = true;
var Types = ["1D_INF_WELL", "3D_BOX", "3D_H"];

const gpu = new GPU();

// Create map with all the variables needed to change wavefunction properties
var WF_VARS = new Map();
WF_VARS.set("1D_INF_WELL_n", 1);
WF_VARS.set("1D_HO_n", 0);
WF_VARS.set("1D_HO_a", 4);
WF_VARS.set("3D_BOX_nx", 1);
WF_VARS.set("3D_BOX_ny", 1);
WF_VARS.set("3D_BOX_nz", 1);
WF_VARS.set("3D_H_n", 1);
WF_VARS.set("3D_H_m", 0);
WF_VARS.set("3D_H_l", 0);

// Variable used for updating changes
var wfChanged = true;

window.onload = function () {

    // Setup Bootstrap components that are needed
    $('select').select2({
        minimumResultsForSearch: -1
    });
    $(':checkbox').radiocheck();

    $('.options-list:visible:first').css({
        'border-radius': '6px !imporatant',
        'padding-top': '6px'
    });

    // Show correct inputs based on selected wavefunction type
    $("#WF_SELECT").change(function(){
        $(".hide").hide();
        WFType = $("#WF_SELECT").val();
        var index = Types.indexOf(WFType);
        $("." + Types[index]).show();
        wfChanged = true;
    });

    // Add change listeners for each variable
    for(var key of WF_VARS.keys()){
        $("#" + key).change(function(e){
            var tempID = e.currentTarget.id;
            WF_VARS.set(tempID, parseInt($("#" + tempID).val()));
        });
        $("#" + key).keypress(function(event){
            if(event.keyCode == 13){
                $("#generate").click();
            }
        });
    }

    // Add click listener to the generation button
    $('#generate').click(function(){
        wfChanged = true;
    });

    // Add change listeners on the switches for displaying
    // the wavefunction and the probability distribution
    $("#WF_ON").change(function(){
        display_wf = !display_wf;
        wfChanged = true;
    });

    $("#PROB_ON").change(function(){
        display_prob = !display_prob;
        wfChanged = true;
    })

    // Add change listeners for splitting along axes in 3D wfns
    $("#XY_SPLIT").change(function(){
        splitXY = (splitXY == 1) ? 2 : 1;
        wfChanged = true;
    })

    $("#XZ_SPLIT").change(function(){
        splitXZ = (splitXZ == 1) ? 2 : 1;
        wfChanged = true;
    })

    $("#YZ_SPLIT").change(function(){
        splitYZ = (splitYZ == 1) ? 2 : 1;
        wfChanged = true;
    })

    setupHSelectors();

    // Run visualizer code
    initVisualizer();
    animate();
};

function setupHSelectors(){

    var n_select = document.getElementById("3D_H_n");
    var l_select = document.getElementById("3D_H_l");
    var m_select = document.getElementById("3D_H_m");

    // n is preset to 1-8
    // l and m are default 0
    // n = 1, 2, 3, ...
    // l = 0, 1, 2, ... , n - 1  
    // m = -l, ..., l

    // If the value of n is changed, update the l and m values
    $("#3D_H_n").change(function(){
        // Clear l and m current values
        clearSelectElement(l_select);
        clearSelectElement(m_select);  

        // Generate options for new l values
        for(var i = 0; i < n_select.value; i++){
            var opt = document.createElement("option");
            opt.value = i;
            opt.text = i;
            l_select.add(opt);
        }
        l_select.value = 0;
        WF_VARS.set("3D_H_l", 0);

        // Add 0 as option for m
        var opt = document.createElement("option");
        opt.value = 0;
        opt.text = 0;
        m_select.add(opt);
        WF_VARS.set("3D_H_m", 0);

        // Update all select dropdowns
        $('select').select2({
            minimumResultsForSearch: -1
        });
    });


    // If the value of l is changed, update the m values
    $("#3D_H_l").change(function(){
        // Clear current values for m
        clearSelectElement(m_select);

        // Generate options for new m values
        for(var i = -l_select.value; i <= l_select.value; i++){
            var opt = document.createElement("option");
            opt.value = i;
            opt.text = i;
            m_select.add(opt);
        }
        m_select.value = 0;
        WF_VARS.set("3D_H_m", 0);

        // Update all select dropdowns
        $('select').select2({
            minimumResultsForSearch: -1
        });
    });

}

function clearSelectElement(element){
    for(var i = element.length - 1; i >= 0; i--){
        element.remove(i);
    }
}

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
    controls.enableKeys = false;
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
        $('.' + WFType).show();

        // Add padding to bottom component of the option pane list
        $('.options-list:visible:last').css({
            'border-radius': '6px',
            'padding-bottom': '8px'
        });

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
