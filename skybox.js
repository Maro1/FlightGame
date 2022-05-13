class Skybox
{

    constructor(path) {
        this.#init(path);

    }

    #init(path) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
 
        const faceInfos = [
          {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
            url: path.concat("px.png"),
          },
          {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
            url: path.concat("nx.png"),
          },
          {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 
            url: path.concat("py.png"),
          },
          {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
            url: path.concat("ny.png"),
          },
          {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 
            url: path.concat("pz.png"),
          },
          {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 
            url: path.concat("nz.png"),
          },
        ];

        faceInfos.forEach((faceInfo) => {

            const image = new Image();
            image.url = faceInfo.url;
            image.addEventListener('load', function() {
            // Now that the image has loaded upload it to the texture.
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  });

        });
    }
}