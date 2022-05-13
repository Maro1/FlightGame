const MAX_ROLL = Math.PI / 4;
const MAX_PITCH = Math.PI / 8;

class Airplane 
{

    constructor() {
        this.plane_model = new Model("data/airplane/plane.obj");
        this.propeller_model = new Model("data/airplane/propeller.obj");

        this.plane = new Actor();
        this.plane.model = this.plane_model;
        this.propeller = new Actor();
        this.propeller.model = this.propeller_model;
        this.plane.addChild(this.propeller)

        this.propeller.position = [0.0, 0.11, 0.67];
        this.speed = 0.01;
        this.turnRollSpeed = 0.0;
        this.turnPitchSpeed = 0.0;

    }

    update(deltaTime) {
        const amortization = 0.95;

        this.propeller.rotation[2] += deltaTime * this.speed;
        if (this.propeller.rotation[2] > Math.PI * 2) {
            this.propeller.rotation[2] -= Math.PI * 2;
        }

        if (keys["d"] || keys["a"]) {

            var direction = keys["d"] ? 1 : -1;
            this.turnRollSpeed = 0.0007 * direction;
        } 
        else {
            this.turnRollSpeed *= amortization;
        }

        if (keys["w"] || keys["s"]) {
            var direction = keys["s"] ? 1 : -1;
            this.turnPitchSpeed = 0.0007 * direction;
        } 
        else {
            this.turnPitchSpeed *= amortization;
        }

        this.plane.rotation[2] += this.turnRollSpeed * deltaTime;
        this.plane.rotation[0] += this.turnPitchSpeed * deltaTime;

        var y = -Math.sin(this.plane.rotation[0])
        var x = Math.sin(this.plane.rotation[1])*Math.cos(this.plane.rotation[0])
        var z = Math.cos(this.plane.rotation[1])*Math.cos(this.plane.rotation[0])

        var deltaPos = [x * 0.1, y * 0.1, z * 0.1] 
        this.plane.position = m4.addVectors(this.plane.position, deltaPos);

        this.plane.update();
    }
}