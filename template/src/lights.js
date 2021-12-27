import {AmbientLight} from "../../3party/three/build/three.module.js";

const ambient = new AmbientLight(0xffffff,0.2);
ambient.addToScene = (scene) => scene.add(ambient);
ambient.setName = ()=>{};
ambient.tick = ()=>{};
ambient.addToUI = ()=>{};

const lights = {
ambient:ambient,
};

export { lights };
