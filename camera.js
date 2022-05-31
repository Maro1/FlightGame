class Camera extends Actor
{
    constructor(aspect) {
        super();

        this.translate(0.0, 1.5, -5.0);
        this.rotate([0.0, 1.0, 0.0], Math.PI);
        this.rotate([-1.0, 0.0, 0.0], Math.PI / 16);

        this.aspect = aspect;

        this.moveSpeed = 0.01;
        this.lookSpeed = 0.002;
        this.firstMove = true;

        document.addEventListener("keydown", (e) => {
          keys[e.key] = true;
          this.keyDown(e.key);
        });

        document.addEventListener("keyup", (e) => {
          keys[e.key] = false;
        });
    }

    viewMatrix()
    {
        return m4.inverse(this.worldTransform());
    }

    projMatrix()
    {
        return m4.perspective(0.7, this.aspect, 0.1, 100000);
    }

    nextView() {
        this.setPosition(0.0, 1.5, -10.0);
    }

    keyDown(key) {
        if (key == "c") {
            this.nextView();
        }
    }
}