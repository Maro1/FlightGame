/** @type {HTMLCanvasElement} */
var canvas;

/** @type {WebGLRenderingContext} */
var gl;

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

    var terrain = scene.addActorFromModel("data/terrain/terrain.obj");
    terrain.scale(10, 10, 10);
    terrain.translate(0.0, -50.0, 0.0);

    var water = scene.addActorFromModel("data/water/water.obj");
    water.scale(3000, 1000, 4000);
    water.translate(-0.2, -0.55, 0.0);
}

function run(now)
{
    if (now == undefined) {
      now = 0;
    }
    var dt = now - prev_time; 

    scene.update(dt);
    scene.draw();

    //shadowMap.draw(actors);

    //airplane.update(dt);
    //terrain.update(dt);
    //water.update(dt);


    prev_time = now;
    window.requestAnimationFrame(run); 
}

function main() 
{
    init();
    run();
}

main();