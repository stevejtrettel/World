import {
    PerspectiveCamera,
    DirectionalLight,
} from "../../../3party/three/build/three.module.js";


function createCamera() {
    const camera = new PerspectiveCamera(
        55, // fov = Field Of View
        1, // aspect ratio (dummy value)
        0.1, // near clipping plane
        200, // far clipping plane
    );

    // move the camera back so we can view the scene
    //camera.position.set(0, 0.1, 0);
    camera.position.set(0, 8, 10);
    camera.lookAt(0,0,0);


    //animation for camera:
    camera.tick = () => {
        //default = do nothing here
        // camera.fov += 0.5;
        // camera.updateProjectionMatrix();
    };

    return camera;
}



function createCameraLight() {

    //const cameraLight = new PointLight('white', 5);
    const cameraLight = new DirectionalLight('white', 1);


    //move light directly behind us
    //this position will be relative to the camera's frame
    cameraLight.position.set(0.5,0.5,0.5);

    //cameraLight.castShadow=true;

    return cameraLight;
}



export { createCamera, createCameraLight };
