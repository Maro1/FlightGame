class Scene 
{

    constructor() {
        this.actors = []
        this.camera = new Camera(canvas.width / canvas.height);
        this.skybox = new Skybox("data/skybox");
        this.airplane = new Airplane();
        this.airplane.plane.addChild(this.camera);
        this.shadowMap = new ShadowMap(2048);

        this.lightDir = [0.53, 0.76, -0.37];
        this.lightPos = [-5300, 7600, 3700];

        this.shadowShader = webglUtils.createProgramFromScripts(gl, ["shadow-vs", "shadow-fs"]);
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

        this.lightPos = [this.airplane.plane.position()[0], this.lightPos[1], this.airplane.plane.position()[2]];
    }

    draw(options) {
        if (options.Shadows) {
            gl.cullFace(gl.FRONT);
            this.shadowMap.bind();
            this.#draw(true);
            gl.cullFace(gl.BACK);
        }

        this.shadowMap.unbind();
        this.#draw(false, options);
    }

    #draw(shadowMap, options) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        let lightView = m4.inverse(m4.lookAt(this.lightPos, this.airplane.plane.position(), [0, 0, 1]));

        let lightProj = m4.orthographic(-2, 2, -2, 2, 0.01, 10000);
        let lightSpace = m4.multiply(lightProj, lightView);

        if (shadowMap) {
            gl.useProgram(this.shadowShader);
            gl.uniformMatrix4fv(gl.getUniformLocation(this.shadowShader, "lightSpaceMatrix"), false, lightSpace);

            // Only airplane has shadow
            this.airplane.draw(this.shadowShader, true);
        }
        else {
            gl.useProgram(shaderProgram);
            gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "view"), false, this.camera.viewMatrix());
            gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "proj"), false, this.camera.projMatrix());
            gl.uniform3f(gl.getUniformLocation(shaderProgram, "viewPos"), this.camera.worldPos()[0], this.camera.worldPos()[1], this.camera.worldPos()[2]);
            gl.uniform3f(gl.getUniformLocation(shaderProgram, "lightDir"), this.lightDir[0], this.lightDir[1], this.lightDir[2]);

            gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "lightSpaceMatrix"), false, lightSpace);

            if (options.Shadows) {
                gl.uniform1i(gl.getUniformLocation(shaderProgram, "useShadows"), 1);
            }
            else {
                gl.uniform1i(gl.getUniformLocation(shaderProgram, "useShadows"), 0);
                var shadowMapLocation = gl.getUniformLocation(shaderProgram, "shadowMap");
                gl.uniform1i(shadowMapLocation, 3);
                gl.activeTexture(gl.TEXTURE3);
                gl.bindTexture(gl.TEXTURE_2D, this.shadowMap.depthTexture);
            }

            this.actors.forEach(function(a){
                a.draw(shaderProgram, false);
            });
            
            this.airplane.draw(shaderProgram, false);


            var skyboxLocation = gl.getUniformLocation(shaderProgram, "skybox");
            gl.uniform1i(skyboxLocation, 4);

            if (this.skybox.texture != undefined) {
                gl.activeTexture(gl.TEXTURE4);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.skybox.texture);
            }

            this.skybox.draw(this.camera.viewMatrix(), this.camera.projMatrix());
        }

    }
}