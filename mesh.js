class Mesh {
    constructor(filepath) {
        this.#loadOBJ(filepath);
    }

    draw() {
        if (this.mesh != undefined) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer)
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.drawArrays(gl.TRIANGLES, 0, this.mesh.nface * 3);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        }
    }

    async #loadOBJ(filepath) {
        await fetch(filepath).then(response => response.text()).then(text => this.#parseObj(text));
        this.#initMesh();
    }

    #parseObj(text) {
        var result = glmReadOBJ(text, new subd_mesh());
        this.mesh = result.mesh;
    }

    #initMesh() {
        var x = [], y = [], z = [];
        var xt = [], yt = [];

        var normals = [];
        var texCoords = [];
        var positions = [];

        for (let i = 0; i < this.mesh.nvert; i++) {
            x[i] = this.mesh.vert[i + 1].x;
            y[i] = this.mesh.vert[i + 1].y;
            z[i] = this.mesh.vert[i + 1].z;
        }

        for (var i = 0; i < this.mesh.textCoords.length - 1; i++) {
            xt[i] = this.mesh.textCoords[i + 1].u;
            yt[i] = this.mesh.textCoords[i + 1].v;
        }

        for (let i = 0; i < this.mesh.nface; i++) {
            var i0 = this.mesh.face[i + 1].vert[0] - 1;
            var i1 = this.mesh.face[i + 1].vert[1] - 1;
            var i2 = this.mesh.face[i + 1].vert[2] - 1;

            positions.push(x[i0], y[i0], z[i0], x[i1], y[i1], z[i1], x[i2], y[i2], z[i2]);

            for (let j = 0; j < 3; j++) {
                normals.push(this.mesh.facetnorms[i + 1].i);
                normals.push(this.mesh.facetnorms[i + 1].j);
                normals.push(this.mesh.facetnorms[i + 1].k);
            }

            i0 = this.mesh.face[i + 1].textCoordsIndex[0] - 1;
            i1 = this.mesh.face[i + 1].textCoordsIndex[1] - 1;
            i2 = this.mesh.face[i + 1].textCoordsIndex[2] - 1;
            texCoords.push(xt[i0], yt[i0], xt[i1], yt[i1], xt[i2], yt[i2]);
        }

        // Vertex position buffer
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // Vertex normal buffer 
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        // Vertex texcoord buffer 
        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
    }
}

class Model {

    constructor(filepath) {
        this.mesh = new Mesh(filepath)
        this.textures = this.#loadTextures(filepath);


    }

    #loadTextures(filepath) {
        var texturePath = filepath.substring(0, filepath.indexOf(".obj"));
        var diffuse_texture = this.#loadTexture(texturePath.concat("_diffuse.png"))
        var specular_texture = this.#loadTexture(texturePath.concat("_specular.png"))

        return [diffuse_texture, specular_texture];
    }

    #loadTexture(filepath) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 255]));

        var diffuseImage = new Image();
        diffuseImage.src = filepath;
        diffuseImage.addEventListener("load", () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                diffuseImage);
            gl.generateMipmap(gl.TEXTURE_2D);
        });
        return texture;
    }

    draw() {
        var diffuseLocation = gl.getUniformLocation(shaderProgram, "diffuseMap");
        var specularLocation = gl.getUniformLocation(shaderProgram, "specularMap");

        gl.uniform1i(diffuseLocation, 0);
        gl.uniform1i(specularLocation, 1);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);

        this.mesh.draw();
    }
}

class Actor
{

    constructor() {
        this.position = new Float32Array([0, 0, 0]);
        this.rotation = new Float32Array([0, 0, 0]);
        this.scale = new Float32Array([1, 1, 1]);
        this.parent = undefined;
        this.children = [];
        this.model = undefined;

        if (this.parent != undefined) {
            this.worldTransform = m4.multiply(this.parent.transform(), this.transform());
        }
        else {
            this.worldTransform = this.transform();
        }
    }

    transform() {
        var modelMat = m4.identity();
        modelMat = m4.translate(modelMat, this.position[0], this.position[1], this.position[2]);
        modelMat = m4.xRotate(modelMat, this.rotation[0]);
        modelMat = m4.yRotate(modelMat, this.rotation[1]);
        modelMat = m4.zRotate(modelMat, this.rotation[2]);
        modelMat = m4.scale(modelMat, this.scale[0], this.scale[1], this.scale[2]);

        return modelMat;
    }

    worldPos()
    {
        if (this.parent != undefined) {
            return m4.addVectors(this.parent.worldPos(), this.position);
        }
        else {
            return this.position;
        }
    }

    worldRot()
    {
        if (this.parent != undefined) {
            return m4.addVectors(this.parent.worldRot(), this.rotation);
        }
        else {
            return this.rotation;
        }
    }

    update(deltaTime) {
        if (this.parent != undefined) {
            this.worldTransform = m4.multiply(this.parent.transform(), this.transform());
        }
        else {
            this.worldTransform = this.transform();
        }
        this.children.forEach(c => c.update(deltaTime));


        var invModel = m4.inverse(this.worldTransform);
        var transInvModel = m4.transpose(invModel);

        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "model"), false, this.worldTransform);
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "transInvModel"), false, transInvModel);

        this.#draw();
    }

    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    #draw() {
        if (this.model != undefined) {
            this.model.draw();
        }
    }

}