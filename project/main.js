/** @type {HTMLCanvasElement} */
var canvas;

/** @type {WebGLRenderingContext} */
var gl;

/* GUI control options */
var g_options = {
    Shadows: true,
    NormalMap: true,
    Fog: true,
    FogAmount: 0.5,
    FOV: 45,
    OrbitMode: false,
    LightDirectionX: 1,
    LightDirectionY: 1,
    LightDirectionZ: 1,
    LightColor: "#ffcccc",
    LightIntensity: 0.003
}

function makeGUI() {
    const gui = new dat.GUI();
    gui.add(g_options, "Shadows");
    gui.add(g_options, "NormalMap");
    gui.add(g_options, "Fog");
    gui.add(g_options, "FogAmount", 0.0, 1);
    gui.add(g_options, "FOV");
    gui.add(g_options, "OrbitMode");
    gui.add(g_options, "LightDirectionX");
    gui.add(g_options, "LightDirectionY");
    gui.add(g_options, "LightDirectionZ");
    gui.addColor(g_options, "LightColor");
    gui.add(g_options, "LightIntensity", 0, 0.01);
}

/* Touch controls */
var touchStarted = false;

function touchStart(e) {
    if(e.touches) {
        x = e.touches[0].pageX - canvas.offsetLeft;
        y = e.touches[0].pageY - canvas.offsetTop;

        if (g_options.OrbitMode) {
            touchStarted = true;
            return;
        }

        /* Control based on where on screen you touch */
        if (x < canvas.width / 4) {
            keys["a"] = true;
        }
        if (x > 3 * (canvas.width / 4)) {
            keys["d"] = true;
        }
        if (y < canvas.height / 4) {
            keys["w"] = true;
        }
        if (y > 3 * (canvas.height / 4)) {
            keys["s"] = true;
        }

        e.preventDefault();
    }
}

function touchMove(e) {
    /* Call mouse moved with x pos if orbit mode */
    if (touchStarted) {
        e.pageX = e.touches[0].pageX;
        scene.camera.mouseMoved(e);
    }
}

function touchEnd(e) {
    touchStarted = false; 
    for (i in keys) {
        keys[i] = false;
    }
}


var scene;
var shaderProgram;
var prev_time = 0;
var keys = {};

function init()
{
    /* Setup canvas */
    canvas = document.getElementById("main_canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    /* Touch events */
    canvas.addEventListener("touchstart", touchStart);
    canvas.addEventListener("touchmove", touchMove);
    canvas.addEventListener("touchend", touchEnd);

    /* WebGL viewport and config */
    gl = canvas.getContext("webgl");
    gl.getExtension('WEBGL_depth_texture');
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);

    makeGUI();
    
    shaderProgram = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);

    /* Create scene and add transformed objects */
    scene = new Scene();

    var terrain = scene.addActorFromModel("data/landscape/landscape.obj");
    terrain.scale(300, 300, 300);
    terrain.translate(0.0, -1.8, 0.0);

    var water = scene.addActorFromModel("data/water/water.obj");
    water.scale(9000, 9000, 9000);

    var cube = scene.addActorFromModel("data/cube/cube.obj");
    cube.scale(20, 20, 20);
    cube.translate(0, 5, -230);
    cube.rotate([0, 0, 1], Math.PI);

    scene.airplane.plane.translate(0, 100, -5000);
    scene.airplane.plane.scale(0.5, 0.5, 0.5);
}

function run(now)
{
    if (now == undefined) {
      now = 0;
    }
    var dt = now - prev_time; 

    scene.update(dt);
    scene.draw();

    prev_time = now;
    window.requestAnimationFrame(run); 
}

function main() 
{
    init();
    run();
}

main();