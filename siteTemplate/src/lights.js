import {
    AmbientLight,
    DirectionalLight} from "../../3party/three/build/three.module.js";

const ambient = new AmbientLight(0xffffff,0.2);
ambient.addToScene = (scene) => scene.add(ambient);
ambient.setName = ()=>{};
ambient.tick = ()=>{};
ambient.addToUI = ()=>{};



const direction = new DirectionalLight(0xffffff,1.5);
direction.addToScene = (scene) => scene.add(direction);
direction.setName = ()=>{};
direction.tick = ()=>{};
direction.addToUI = ()=>{};






const lights = {
    ambient:ambient,
    direction: direction,
};




export { lights };
