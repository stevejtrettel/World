import {
    PerspectiveCamera,
    DirectionalLight,
} from "../../../3party/three/build/three.module.js";


let defaultOptions = {fov:55,pos:{x:1,y:0,z:5},look:{x:0,y:0,z:0}};

function createCamera(options=defaultOptions) {
    const camera = new PerspectiveCamera(
        options.fov||55, // fov = Field Of View
        1, // aspect ratio (dummy value)
        0.1, // near clipping plane
        200, // far clipping plane
    );

    // move the camera back so we can view the scene
    //camera.position.set(0, 0.1, 0);
    camera.position.set(options.pos.x||0, options.pos.y||8, options.pos.z||10);
    camera.lookAt(options.look.x||0,options.look.y||0,options.look.z||0);


    //animation for camera:
    camera.tick = (time,dTime) => {
        if(options.animate){
            let pos = options.posAnimate(time);
            let look = options.lookAnimate(time);
            console.log(pos);
            camera.position.set(pos.x,pos.y,pos.z);
            camera.lookAt(look.x,look.y,look.z);
            camera.updateProjectionMatrix();
        }
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
