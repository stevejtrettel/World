import {Vector3} from "../../../../3party/three/build/three.module.js";

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function randomVector3(rng){
    let x = getRandom(-rng,rng);
    let y = getRandom(-rng,rng);
    let z = getRandom(-rng,rng);
    return new Vector3(x,y,z);
}



export {getRandom, randomVector3};