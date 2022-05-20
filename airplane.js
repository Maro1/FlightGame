const MAX_ROLL = Math.PI / 4;
const MAX_PITCH = Math.PI / 8;

class Airplane {

    constructor() {
        this.plane_model = new Model("data/airplane/plane.obj");
        this.propeller_model = new Model("data/airplane/propeller.obj");

        this.plane = new Actor();
        this.plane.model = this.plane_model;
        this.propeller = new Actor();
        this.propeller.model = this.propeller_model;
        this.plane.addChild(this.propeller)

        this.propeller.translate(0.0, 0.11, 0.67);
        this.speed = 1.0;
        this.turnRollSpeed = 0.0;
        this.turnPitchSpeed = 0.0;

        this.forward = new Float32Array([0.0, 0.0, 1.0, 1.0]);
        this.right = new Float32Array([1.0, 0.0, 0.0, 1.0]);
    }

    update(deltaTime) {
        const amortization = 0.96;

        this.propeller.rotate([0.0, 0.0, 1.0], deltaTime * this.speed);
        if (keys["d"] || keys["a"]) {

            var direction = keys["d"] ? 1 : -1;
            this.turnRollSpeed = 0.0007 * direction;
        }
        else {
            this.turnRollSpeed *= amortization;
        }

        if (keys["w"] || keys["s"]) {
            var direction = keys["w"] ? 1 : -1;
            this.turnPitchSpeed = 0.0007 * direction;
        }
        else {
            this.turnPitchSpeed *= amortization;
        }

        if (this.turnRollSpeed != 0) 
            this.plane.rotate([0, 0, 1], this.turnRollSpeed * deltaTime);
        
        if (this.turnPitchSpeed != 0)
            this.plane.rotate([1, 0, 0], this.turnPitchSpeed * deltaTime);

        this.plane.translate(0, 0, this.speed);

        this.plane.update();
    }
}