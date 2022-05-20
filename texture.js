async function loadImage(path) {
    const img = new Image();

    let _resolve;
    const promise = new Promise((resolve) => _resolve = resolve);

    img.onload = () => {
        _resolve(img);
    }

    img.src = path;

    return promise;
}


class Texture {
  constructor(filepath, target) {
    this.target = target;
    this.#loadTexture(filepath);
  }

  #loadTexture(filepath) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    this.texture = gl.createTexture();
    gl.bindTexture(this.target, this.texture);

    gl.texImage2D(
        this.target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255]));

    var image = new Image();
    image.src = filepath;
    image.addEventListener('load', () => {
      gl.bindTexture(this.target, this.texture);
      gl.texImage2D(this.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
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
    gl.depthFunc(gl.LEQUAL);
    gl.useProgram(this.skyboxShader);

    gl.uniform1i(gl.getUniformLocation(this.skyboxShader, 'skybox'), 2);
    gl.activeTexture(gl.TEXTURE2);

    var viewProjInv = view;
    viewProjInv[12] = 0;
    viewProjInv[13] = 0;
    viewProjInv[14] = 0;

    viewProjInv = m4.multiply(proj, viewProjInv);
    viewProjInv = m4.inverse(viewProjInv);

    gl.uniformMatrix4fv(
        gl.getUniformLocation(this.skyboxShader, 'viewProjInv'), false,
        viewProjInv);

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.depthFunc(gl.LESS);
  }

  #init(path) {
    this.skyboxShader =
        webglUtils.createProgramFromScripts(gl, ['skybox-vs', 'skybox-fs']);
    gl.useProgram(this.skyboxShader);

    Promise
        .all(
            [loadImage(path.concat('/px.png')),
            loadImage(path.concat('/nx.png')),
            loadImage(path.concat('/py.png')),
            loadImage(path.concat('/ny.png')),
            loadImage(path.concat('/pz.png')),
            loadImage(path.concat('/nz.png'))])
        .then(function(images) {
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          this.texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

          gl.texParameteri(
              gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(
              gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(
              gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(
              gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

          images.forEach((image, index) => {
            gl.texImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + index, 0, gl.RGBA, gl.RGBA,
                gl.UNSIGNED_BYTE, image);
          });

          gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
          gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,
          gl.LINEAR_MIPMAP_LINEAR);
        }.bind(this));

    var positions = new Float32Array([
      -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, -1.0, 1.0
    ]);


    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  }
}