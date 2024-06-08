import {
    Scene,
    Color,
} from "../../../3party/three/build/three.module.js";


function createScene ( color ) {
    let scene = new Scene();
    scene.background = new Color().set(color);

    return scene;
}

export { createScene };
