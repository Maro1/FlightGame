

const options = {
    doTheThing: true,
}

function makeGUI() {
    const gui = new dat.GUI();
    gui.add(options, "doTheThing");
    console.log("Logged");
}