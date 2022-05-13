class Camera extends Actor
{
    constructor(aspect) {
        super();

        this.position = [0.0, 0.0, -5.0];
        this.rotation = [0.0, Math.PI, 0.0];

        this.aspect = aspect;

        this.moveSpeed = 0.01;
        this.lookSpeed = 0.002;
        this.firstMove = true;
    }

    viewMatrix()
    {
        var viewMat = m4.identity();
        viewMat = m4.xRotate(viewMat, -this.worldRot()[0]);
        viewMat = m4.yRotate(viewMat, -this.worldRot()[1]);
        viewMat = m4.zRotate(viewMat, -this.worldRot()[2]);

        viewMat = m4.translate(viewMat, -this.worldPos()[0], -this.worldPos()[1], -this.worldPos()[2]);
        return viewMat;
    }

    projMatrix()
    {
        return m4.perspective(0.7, this.aspect, 0.1, 10000);
    }

    update(keys, dt)
    {
        // Forward/backward
        //if (keys["w"] || keys["s"]) {
        //    var direction = keys["w"] ? 1 : -1;
        //    this.position[0] += this.front[0] * this.moveSpeed * direction * dt;
        //    this.position[1] += this.front[1] * this.moveSpeed * direction * dt;
        //    this.position[2] += this.front[2] * this.moveSpeed * direction * dt;
        //} 
        // Left/right 
        //if (keys["d"] || keys["a"]) {
        //    var right= m4.cross(this.front, this.up);
        //    var direction = keys["d"] ? 1 : -1;
        //    this.position[0] += right[0] * this.moveSpeed * direction * dt;
        //    this.position[1] += right[1] * this.moveSpeed * direction * dt;
        //    this.position[2] += right[2] * this.moveSpeed * direction * dt;
        //} 
    }

    //mouseMoved(e) {
    //    if (this.firstMove) {
    //        this.firstMove = false;
    //        this.prevX = e.offsetX;
    //        this.prevY = e.offsetY;
    //        return;
    //    }
    //    var x = this.prevX - e.offsetX;
    //    var y = this.prevY - e.offsetY;

    //    var rotation = m4.identity();
    //    rotation = m4.yRotate(rotation, x * this.lookSpeed);
    //    rotation = m4.xRotate(rotation, y * this.lookSpeed);

    //    this.front = m4.transformVector(rotation, new Float32Array([this.front[0], this.front[1], this.front[2], 1])).slice(0, 3);
    //    this.prevX = e.offsetX;
    //    this.prevY = e.offsetY;
    //}

}