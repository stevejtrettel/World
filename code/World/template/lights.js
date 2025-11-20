import {
    AmbientLight,
    DirectionalLight,
} from "../../../3party/three/build/three.module.js";

const ambient = new AmbientLight(0xffffff,0.8);
ambient.addToScene = (scene) => scene.add(ambient);
ambient.setName = ()=>{};
ambient.tick = ()=>{};
ambient.addToUI = ()=>{};

const direction = new DirectionalLight(0xffffff,3.5);
direction.addToScene = (scene) => scene.add(direction);
direction.setName = ()=>{};
direction.tick = ()=>{};
direction.addToUI = ()=>{};


const direction2 = new DirectionalLight(0xffffff,1.5);
direction2.position.set(0,1,1);
direction2.addToScene = (scene) => scene.add(direction);
direction2.setName = ()=>{};
direction2.tick = ()=>{};
direction2.addToUI = ()=>{};


const lights = {
    ambient:ambient,
    direction: direction,
    direction2: direction2
};


export  {lights};
