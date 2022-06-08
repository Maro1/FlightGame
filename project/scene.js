class Scene 
{

    constructor() {
        this.actors = []
        this.camera = new Camera(canvas.width / canvas.height);
        this.skybox = new Skybox("data/skybox");
        this.airplane = new Airplane();
        this.airplane.plane.addChild(this.camera);
        this.shadowMap = new ShadowMap(2048);

        this.lightDir = [1, 1, 1];
        this.lightPos = [5000, 5000, 5000];


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
        this.lightDir = [g_options.LightDirectionX, g_options.LightDirectionY, g_options.LightDirectionZ];

        // Have light follow airplane since only airplane casts shadow, 
        // and only direction is used for lighting calculation
        this.lightPos = this.airplane.plane.position();
        this.lightPos = m4.addVectors(this.lightPos, [this.lightDir[0] * 200, this.lightDir[1] * 200, this.lightDir[2] * 200]);
    }

    draw() {
        if (g_options.Shadows) {
            // For shadow map draw, cull front face instead of back face
            // because of the use of a bias, which decreases the shadow offset
            gl.cullFace(gl.FRONT);
            this.shadowMap.bind();
            this.#draw(true);
            gl.cullFace(gl.BACK);
        }

        this.shadowMap.unbind();
        this.#draw(false);
    }

    #draw(shadowMap) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        let lightView = m4.inverse(m4.lookAt(this.lightPos, this.airplane.plane.position(), [0, 1, 0]));

        let lightProj = m4.orthographic(-2, 2, -2, 2, 0.01, 20000);
        let lightSpace = m4.multiply(lightProj, lightView);

        if (shadowMap) {
            gl.useProgram(this.shadowShader);
            gl.uniformMatrix4fv(gl.getUniformLocation(this.shadowShader, "lightSpaceMatrix"), false, lightSpace);

            // Only airplane has shadow
            this.airplane.draw(this.shadowShader, true);
        }
        else {
            gl.useProgram(shaderProgram);

            /* Update per-draw uniforms */
            gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "view"), false, this.camera.viewMatrix());
            gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "proj"), false, this.camera.projMatrix());
            gl.uniform3f(gl.getUniformLocation(shaderProgram, "viewPos"), this.camera.worldPos()[0], this.camera.worldPos()[1], this.camera.worldPos()[2]);
            gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "lightSpaceMatrix"), false, lightSpace);
            gl.uniform3f(gl.getUniformLocation(shaderProgram, "lightDir"), this.lightDir[0], this.lightDir[1], this.lightDir[2]);

            // Color is given as hex string, convert to rgb
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(g_options.LightColor);
            var r= parseInt(result[1], 16);
            var g= parseInt(result[2], 16);
            var b= parseInt(result[3], 16);
            gl.uniform3f(gl.getUniformLocation(shaderProgram, "lightColor"), r, g, b);
            gl.uniform1f(gl.getUniformLocation(shaderProgram, "lightIntensity"), g_options.LightIntensity);

            if (g_options.Shadows) {
                gl.uniform1i(gl.getUniformLocation(shaderProgram, "useShadows"), 1);
                var shadowMapLocation = gl.getUniformLocation(shaderProgram, "shadowMap");
                gl.uniform1i(shadowMapLocation, 3);
                gl.activeTexture(gl.TEXTURE3);
                gl.bindTexture(gl.TEXTURE_2D, this.shadowMap.depthTexture);
            }
            else {
                gl.uniform1i(gl.getUniformLocation(shaderProgram, "useShadows"), 0);
            }

            if (g_options.NormalMap) {
                gl.uniform1i(gl.getUniformLocation(shaderProgram, "useNormalMap"), 1);
            }
            else {
                gl.uniform1i(gl.getUniformLocation(shaderProgram, "useNormalMap"), 0);
            }


            if (g_options.Fog) {
                gl.uniform1f(gl.getUniformLocation(shaderProgram, "fogAmount"), g_options.FogAmount);
            }
            else {
                gl.uniform1f(gl.getUniformLocation(shaderProgram, "fogAmount"), 0.0);
            }

            // Skybox cubemap texture has index 4
            var skyboxLocation = gl.getUniformLocation(shaderProgram, "skybox");
            gl.uniform1i(skyboxLocation, 4);

            if (this.skybox.texture != undefined) {
                gl.activeTexture(gl.TEXTURE4);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.skybox.texture);
            }

            // Draw all non-airplane actors
            this.actors.forEach(function(a){
                a.draw(shaderProgram, false);
            });
            
            this.airplane.draw(shaderProgram, false);
            this.skybox.draw(this.camera.viewMatrix(), this.camera.projMatrix());
        }

    }
}