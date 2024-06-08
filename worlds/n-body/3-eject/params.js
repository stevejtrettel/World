
//actually building one of these
import {Vector3} from "../../../3party/three/build/three.module.js";

const pA = {
    mass:1,
    pos: new Vector3(0,0,0),
    vel: new Vector3(0,-0.5,-0.5),
    color: 0xffffff,
    trailLength: 2000,
}

const pB = {
    mass:0.5,
    pos: new Vector3(0,5,0),
    vel: new Vector3(0,0,.5),
    color: 0xd96493,
    trailLength: 2000,
}

const pC = {
    mass:0.3,
    pos: new Vector3(0,0,5),
    vel: new Vector3(-0.2,0.5,0.),
    color: 0x32a852,
    trailLength: 2000,
}


export {pA, pB, pC};
