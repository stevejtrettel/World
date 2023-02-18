import {OrbitControls} from "../../../3party/three/examples/jsm/controls/OrbitControls.js";


const defaultOptions = {minDistance:0,maxDistance:150};

function createControls ( camera, canvas, options=defaultOptions ) {

    const controls = new OrbitControls( camera, canvas );

    //controls.autoRotate = true;
    //controls.autoRotateSpeed=0.75;
    controls.enableDamping = true;
    controls.minDistance = options.minDistance;
    controls.maxDistance = options.maxDistance;
    controls.enablePan = true;

    // damping and auto rotation require
    // the controls to be updated each frame
    controls.tick = () => controls.update();

    return controls;
}


export { createControls };
