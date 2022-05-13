class Light
{
    constructor(position) {
        this.position = position;
        this.mesh = new Mesh("data/cube/cube.obj");
        this.shaderProgram = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "light-shader"]);
    }

    #model() {
        var modelMat = m4.identity();
        modelMat = m4.translate(modelMat, this.position[0], this.position[1], this.position[2]);
        modelMat = m4.scale(modelMat, 0.2, 0.2, 0.2);
        return modelMat;
    }

    draw(projMat, viewMat) {
        gl.useProgram(this.shaderProgram);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "proj"), false, projMat);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "view"), false, viewMat);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "model"), false, this.#model());
        this.mesh.draw();
    }
}

class PointLight extends Light
{

    constructor(position) {
        super(position);
    }
}