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

        this.lookSpeed = 0.02;
        this.firstMove = true;

        this.cameraAngle = 0;

        this.phi = 0;
        this.D = 3;

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
        if (g_options.OrbitMode) {
            let eye = [this.D*Math.sin(this.phi), 
                        1,
                        this.D*Math.cos(this.phi)];

            return m4.inverse(m4.lookAt(m4.addVectors(eye, scene.airplane.plane.position()), scene.airplane.plane.position(), [0, 1, 0]));
        } 
        else {
            return m4.inverse(this.worldTransform());
        }
    }

    projMatrix() {
        return m4.perspective(g_options.FOV * (Math.PI / 180), this.aspect, 0.1, 100000);
    }

    nextView() {
        this.transform = CAMERA_ANGLES[++this.cameraAngle % CAMERA_ANGLES.length];
        console.log(this.transform);
    }

    keyDown(key) {
        if (key == "c" && !g_options.OrbitMode) {
            this.nextView();
        }
    }

    mouseMoved(e) {
        if (!g_options.OrbitMode) {
            return;
        }
        if (this.firstMove) {
            this.firstMove = false;
            this.prevX = e.pageX;
        }

        let dX = (this.prevX - e.pageX) * this.lookSpeed;

        this.phi += dX;
        this.prevX = e.pageX;
    }
}