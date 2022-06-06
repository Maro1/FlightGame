/** @type {HTMLCanvasElement} */
var canvas;

/** @type {WebGLRenderingContext} */
var gl;

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

var scene;
var shaderProgram;
var prev_time = 0;
var keys = {};

function init()
{
    canvas = document.getElementById("main_canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl = canvas.getContext("webgl");

    gl.getExtension('WEBGL_depth_texture');

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);

    makeGUI();
    
    shaderProgram = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);

    scene = new Scene();

    var terrain = scene.addActorFromModel("data/lanscape/landscape.obj");
    terrain.scale(300, 300, 300);
    terrain.translate(0.0, -1.8, 0.0);

    var water = scene.addActorFromModel("data/water/water.obj");
    water.scale(9000, 9000, 9000);
    water.translate(0.0, 0, 0.0);

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