class Scene 
{

    constructor() {
        this.actors = []
        this.camera = new Camera(canvas.width / canvas.height);
        this.skybox = new Skybox("data/skybox");
        this.airplane = new Airplane();
        this.airplane.plane.addChild(this.camera);
        this.shadowMap = new ShadowMap(512);

        this.lightDir = [0.53, 0.76, -0.37];
        this.lightPos = [1000, 1000, 1000];
    }

    addActorFromModel(filepath) {
        var model = new Model(filepath);
        var actor = new Actor();
        actor.model = model;
        this.actors.push(actor)
        return actor;
    }

    update(dt) {
        this.airplane.update(dt);
        this.actors.forEach(a => a.update(dt));
    }

    draw() {
        this.shadowMap.bind();
        this.#draw(true);

        this.shadowMap.unbind();
        this.#draw(false);
    }

    #draw(shadowMap) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        gl.useProgram(shaderProgram);

        if (shadowMap) {
            let viewMat = m4.lookAt(this.lightPos, [0, 0, 0], [0, 1, 0]);
            let projMat = m4.orthographic(-canvas.width / 2, canvas.width / 2, -canvas.height / 2, canvas.height / 2, 0.1, 10000);

            gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "view"), false, viewMat);
            gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "proj"), false, projMat);
            gl.uniform3f(gl.getUniformLocation(shaderProgram, "viewPos"), this.lightPos[0], this.lightPos[1], this.lightPos[2]);
        }
        else {
            gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "view"), false, this.camera.viewMatrix());
            gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "proj"), false, this.camera.projMatrix());
            gl.uniform3f(gl.getUniformLocation(shaderProgram, "viewPos"), this.camera.worldPos()[0], this.camera.worldPos()[1], this.camera.worldPos()[2]);
        }

        gl.uniform3f(gl.getUniformLocation(shaderProgram, "lightDir"), this.lightDir[0], this.lightDir[1], this.lightDir[2]);

        this.actors.forEach(function(a){
            a.draw();
        });
        this.airplane.draw();
        this.skybox.draw(this.camera.viewMatrix(), this.camera.projMatrix());
    }
}