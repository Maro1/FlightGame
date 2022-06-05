

var options = {
    Shadows: false,
}

function guiOptions() {
    return options;
}

function makeGUI() {
    const gui = new dat.GUI();
    gui.add(options, "Shadows");
}