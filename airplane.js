const MAX_ROLL = Math.PI / 4;
const MAX_PITCH = Math.PI / 8;

const MAX_SPEED = 5.0;
const MIN_SPEED = 0.5;

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

        this.propeller.rotate([0.0, 0.0, 1.0], deltaTime * this.speed * 0.01);

        if (keys["+"] && this.speed < MAX_SPEED) {
            this.speed += 0.001 * deltaTime;
        }

        if (keys["-"] && this.speed > MIN_SPEED) {
            this.speed -= 0.001 * deltaTime;
        }

        if ((keys["d"] || keys["a"]) && !g_options.OrbitMode) {
            var direction = keys["d"] ? 1 : -1;
            this.turnRollSpeed = 0.0007 * direction;
        }
        else {
            this.turnRollSpeed *= amortization;
        }

        if (keys["w"] || keys["s"] && !g_options.OrbitMode) {
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

    draw(shader, shadowMap) {
        this.plane.draw(shader, shadowMap);
        this.propeller.draw(shader, shadowMap);
    }
}