const CAMERA_ANGLES = [
    new Float32Array([-1, 0, 0, 0, 0, 1, 0.19, 0, 0, 0.19, -0.98, 0, 0, 1.5, -5, 1]),
    new Float32Array([-1, 0, 0, 0, 0, 1, 0.19, 0, 0, 0.19, -0.98, 0, 0, 1.5, -10, 1]),
    new Float32Array([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, -3, 1]),
    new Float32Array([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0.28, 0.2, 1]),
];

class Camera extends Actor {
    constructor(aspect) {
        super();

        this.transform = CAMERA_ANGLES[0];

        this.aspect = aspect;

        this.lookSpeed = 0.002;
        this.firstMove = true;

        this.angle = 0;

        document.addEventListener("keydown", (e) => {
            keys[e.key] = true;
            this.keyDown(e.key);
        });

        document.addEventListener("keyup", (e) => {
            keys[e.key] = false;
        });

        document.addEventListener("mousemove", (e) => {
            this.mouseMoved(e);
        });
    }

    viewMatrix() {
        return m4.inverse(this.worldTransform());
    }

    projMatrix() {
        return m4.perspective(g_options.FOV * (Math.PI / 180), this.aspect, 0.1, 100000);
    }

    nextView() {
        this.transform = CAMERA_ANGLES[++this.angle % CAMERA_ANGLES.length];
    }

    keyDown(key) {
        if (key == "c") {
            this.nextView();
        }
    }

    mouseMoved(e) {
        if (!g_options.OrbitMode) {
            return;
        }
        if (this.firstMove) {
            this.firstMove = false;
            this.angle = 0;
            this.prevX = e.offsetX;
        }
        let dX = (this.prevX - e.offsetX) * this.lookSpeed;
        this.angle += dX;
        let up = [0, 1, 0];

        //let newPos = scalarMul((1 - Math.cos(dX)) * (m4.dot(this.position(), up)), m4.addVectors(up, scalarMul(Math.cos(dX), m4.addVectors(this.position(), scalarMul(Math.sin(dX), m4.cross(up, this.position()))))));
        let v = (m4.subtractVectors(this.position(), [0, 0, 0]));
        let r = Math.sqrt(v[0] * v[0], v[1] * v[1], v[2] * v[2]);
        let x_new = 10 * Math.sin(this.angle); 
        let z_new = -10 * Math.sin(this.angle); 

        this.setPosition(x_new, 0, z_new);

        this.rotate([0, 1, 0], dX);

        this.prevX = e.offsetX;
    }
}