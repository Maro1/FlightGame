class Texture {

  constructor(filepath, target) {
    this.target = target;
    this.#loadTexture(filepath);
  }

  #loadTexture(filepath) {
    this.texture = gl.createTexture();
    gl.bindTexture(this.target, this.texture);

    gl.texImage2D(this.target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]));

    var image = new Image();
    image.src = filepath;
    image.addEventListener("load", () => {
      gl.bindTexture(this.target, this.texture);
      gl.texImage2D(this.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
        image);
      gl.generateMipmap(this.target);
    });
  }

  bind() {
    gl.bindTexture(this.target, this.texture);
  }
}

class Skybox {

  constructor(path) {
    this.#init(path);
  }

  draw(view, proj) {
    //gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "skybox"), 2);
    //gl.activeTexture(gl.TEXTURE2);

    gl.useProgram(this.shaderProgram);
    var viewProjInv = view;
    viewProjInv[12] = 0;
    viewProjInv[13] = 0;
    viewProjInv[14] = 0;

    viewProjInv = m4.multiply(proj, viewProjInv);
    viewProjInv = m4.inverse(viewProjInv);

    gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "viewProjInv"), false, viewProjInv);

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.drawArrays(gl.TRIANGLES, 0, 2);
  }

  #init(path) {
    this.shaderProgram = webglUtils.createProgramFromScripts(gl, ["skybox-vs", "skybox-fs"]);

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

    const faceInfos = [
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        url: path.concat("/px.png"),
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: path.concat("/nx.png"),
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: path.concat("/py.png"),
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: path.concat("/ny.png"),
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: path.concat("/pz.png"),
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: path.concat("/nz.png"),
      },
    ];

    faceInfos.forEach((faceInfo) => {
      gl.texImage2D(faceInfo.target, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      var image = new Image();
      image.src = faceInfo.url;
      image.addEventListener("load", () => {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        gl.texImage2D(faceInfo.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        //gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      });
    });

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    var positions = new Float32Array(
      [
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }
}