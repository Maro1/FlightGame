/** @type {HTMLCanvasElement} */
var canvas;

/** @type {WebGLRenderingContext} */
var gl;

var camera;
var actors = [];
var airplane;
var terrain;
var water;
var skybox;
var shadowMap;
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
    
    camera = new Camera(canvas.width / canvas.height);
    document.addEventListener("keydown", (e) => {
      keys[e.key] = true;
      camera.keyDown(e.key);
    });

    document.addEventListener("keyup", (e) => {
      keys[e.key] = false;
    });

    shaderProgram = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);
    shadowMap = new ShadowMap(512);

    airplane = new Airplane();
    airplane.plane.addChild(camera);

    skybox = new Skybox("data/skybox");

    var terrain_model = new Model("data/terrain/terrain.obj");
    terrain = new Actor();
    terrain.model = terrain_model;
    terrain.scale(10, 10, 10);
    terrain.translate(0.0, -50.0, 0.0);

    var water_model = new Model("data/water/water.obj");
    water = new Actor();
    water.model = water_model;
    water.scale(3000, 1000, 4000);
    water.translate(-0.2, -0.55, 0.0);

    actors.push(terrain);
    actors.push(water);
    actors.push(airplane.plane);
    actors.push(airplane.propeller);

}

function run(now)
{
    if (now == undefined) {
      now = 0;
    }
    var dt = now - prev_time; 



    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(shaderProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "view"), false, camera.viewMatrix());
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "proj"), false, camera.projMatrix());

    gl.uniform3f(gl.getUniformLocation(shaderProgram, "viewPos"), camera.worldPos()[0], camera.worldPos()[1], camera.worldPos()[2]);
    gl.uniform3f(gl.getUniformLocation(shaderProgram, "lightDir"), 0.53, 0.76, -0.37);

    shadowMap.draw(actors);

    airplane.update(dt);
    terrain.update(dt);
    water.update(dt);

    skybox.draw(camera.viewMatrix(), camera.projMatrix());

    prev_time = now;
    window.requestAnimationFrame(run); 
}

function main() 
{
    init();
    run();
}

main();