import {OrbitControls} from "../../../3party/three/examples/jsm/controls/OrbitControls.js";


function createControls ( camera, canvas ) {

    const controls = new OrbitControls( camera, canvas );

    //controls.autoRotate = true;
    //controls.autoRotateSpeed=0.75;
    controls.enableDamping = true;
    controls.minDistance = 0;
    controls.maxDistance = 150;
    controls.enablePan = true;

    // damping and auto rotation require
    // the controls to be updated each frame
    controls.tick = () => controls.update();

    return controls;
}


export { createControls };
