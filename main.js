/** @type {HTMLCanvasElement} */
var canvas;

/** @type {WebGLRenderingContext} */
var gl;

var camera;
var airplane;
var light;
var terrain;
var shaderProgram;
var prev_time = 0;
var keys = {};
var mouseDown = false;


function init()
{
    canvas = document.getElementById("main_canvas");
    canvas.width = 1500;
    canvas.height = 900;

    gl = canvas.getContext("webgl");
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    camera = new Camera(canvas.width / canvas.height);
    document.addEventListener("keydown", (e) => {
      keys[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
      keys[e.key] = false;
    });

    shaderProgram = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);

    airplane = new Airplane();
    airplane.plane.addChild(camera);

    light = new Light([2.0, 2.0, 4.0]);

    var terrain_model = new Model("data/terrain/terrain.obj");
    terrain = new Actor();
    terrain.model = terrain_model;
    terrain.position = [0.0, -10.0, 0.0];

}

function run(now)
{
    if (now == undefined) {
      now = 0;
    }
    var dt = now - prev_time; 


    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(shaderProgram);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "view"), false, camera.viewMatrix());
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "proj"), false, camera.projMatrix());

    gl.uniform3f(gl.getUniformLocation(shaderProgram, "camPos"), camera.worldPos()[0], camera.worldPos()[1], camera.worldPos()[2]);
    gl.uniform3f(gl.getUniformLocation(shaderProgram, "lightPos"), light.position[0], light.position[1], light.position[2]);

    airplane.update(dt);
    terrain.update(dt);

    light.position[0] = 2 * Math.cos(now * 0.001);
    light.position[2] = 2 * Math.sin(now * 0.001);

    light.draw(camera.projMatrix(), camera.viewMatrix());

    prev_time = now;
    window.requestAnimationFrame(run); 
}

function main() 
{
    init();
    run();
}

main();