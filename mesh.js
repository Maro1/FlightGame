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

            gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentsBuffer)
            gl.enableVertexAttribArray(3);
            gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bitangentsBuffer)
            gl.enableVertexAttribArray(4);
            gl.vertexAttribPointer(4, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.drawArrays(gl.TRIANGLES, 0, this.mesh.nface * 3);
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
        var tangents = [];
        var bitangents = [];

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

            // Edges used for tangent/bitangent
            let e1 = [x[i1] - x[i0], y[i1] - y[i0], z[i1] - z[i0]];
            let e2 = [x[i2] - x[i0], y[i2] - y[i0], z[i2] - z[i0]];

            i0 = this.mesh.face[i + 1].textCoordsIndex[0] - 1;
            i1 = this.mesh.face[i + 1].textCoordsIndex[1] - 1;
            i2 = this.mesh.face[i + 1].textCoordsIndex[2] - 1;
            texCoords.push(xt[i0], yt[i0], xt[i1], yt[i1], xt[i2], yt[i2]);

            // Tangent and bitangent calculation
            let dUV1 = [xt[i1] - xt[i0], yt[i1] - y[i0]];
            let dUV2 = [xt[i2] - xt[i0], yt[i2] - y[i0]];

            let f = 1.0 / (dUV1[0] * dUV2[1] - dUV2[0] * dUV1[1]);

            let tx = f * (dUV2[1] * e1[0] - dUV1[1] * e2[0]);
            let ty = f * (dUV2[1] * e1[1] - dUV1[1] * e2[1]);
            let tz = f * (dUV2[1] * e1[2] - dUV1[1] * e2[2]);

            let btx = f * (-dUV2[0] * e1[0] + dUV1[0] * e2[0]);
            let bty = f * (-dUV2[0] * e1[1] + dUV1[0] * e2[1]);
            let btz = f * (-dUV2[0] * e1[2] + dUV1[0] * e2[2]);

            tangents.push(tx, ty, tz);
            tangents.push(tx, ty, tz);
            tangents.push(tx, ty, tz);
            bitangents.push(btx, bty, btz);
            bitangents.push(btx, bty, btz);
            bitangents.push(btx, bty, btz);
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

        // Vertex tangents buffer
        this.tangentsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentsBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangents), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 0, 0);

        // Vertex bitangents buffer
        this.bitangentsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bitangentsBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bitangents), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(4);
        gl.vertexAttribPointer(4, 3, gl.FLOAT, false, 0, 0);
    }
}

class Model {

    constructor(filepath) {
        this.mesh = new Mesh(filepath)
        this.textures = this.#loadTextures(filepath);
    }

    #loadTextures(filepath) {
        var texturePath = filepath.substring(0, filepath.indexOf(".obj"));

        var diffuse_texture = new Texture(texturePath.concat("_diffuse.png"), gl.TEXTURE_2D);
        var specular_texture = new Texture(texturePath.concat("_specular.png"), gl.TEXTURE_2D);
        var normal_texture = new Texture(texturePath.concat("_normal.png"), gl.TEXTURE_2D);

        return [diffuse_texture, specular_texture, normal_texture];
    }

    draw(shadowMap) {
        if (!shadowMap) {
            var diffuseLocation = gl.getUniformLocation(shaderProgram, "diffuseMap");
            var specularLocation = gl.getUniformLocation(shaderProgram, "specularMap");
            var normalLocation = gl.getUniformLocation(shaderProgram, "normalMap");

            gl.uniform1i(diffuseLocation, 0);
            gl.uniform1i(specularLocation, 1);
            gl.uniform1i(normalLocation, 2);

            gl.activeTexture(gl.TEXTURE0);
            this.textures[0].bind();

            gl.activeTexture(gl.TEXTURE1);
            this.textures[1].bind();

            gl.activeTexture(gl.TEXTURE2);
            this.textures[2].bind();
        }

        this.mesh.draw();
    }
}

class Actor
{

    constructor() {
        this.transform = m4.identity();
        this.parent = undefined;
        this.children = [];
        this.model = undefined;
    }

    update(deltaTime) {
        this.children.forEach(c => c.update(deltaTime));
    }

    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    worldTransform() {
        if (this.parent != undefined) {
            return m4.multiply(this.parent.transform, this.transform);
        }
        else {
            return this.transform;
        }
    }

    right() {
        return new Float32Array([-this.worldTransform()[0], -this.worldTransform()[1], -this.worldTransform()[2]]);
    }

    forward() {
        return new Float32Array([this.worldTransform()[8], this.worldTransform()[9], this.worldTransform()[10]]);
    }

    worldPos() {
        return new Float32Array([this.worldTransform()[12], this.worldTransform()[13], this.worldTransform()[14]]);
    }

    setPosition(x, y, z) {
        this.transform[12] = x;
        this.transform[13] = y;
        this.transform[14] = z;
    }

    position() {
        return [this.transform[12], this.transform[13], this.transform[14]];
    }

    translate(dX, dY, dZ) {
        this.transform = m4.translate(this.transform, dX, dY, dZ);
    }

    scale(x, y, z) {
        this.transform = m4.scale(this.transform, x, y, z);
    }

    rotate(axis, angle) {
        this.transform = m4.axisRotate(this.transform, axis, angle);
    }

    draw(shader, shadowMap) {
        if (this.model != undefined) {
            var invModel = m4.inverse(this.worldTransform());
            var transInvModel = m4.transpose(invModel);

            gl.uniformMatrix4fv(gl.getUniformLocation(shader, "model"), false, this.worldTransform());
            gl.uniformMatrix4fv(gl.getUniformLocation(shader, "transInvModel"), false, transInvModel);

            this.model.draw(shadowMap);
        }
    }

}