import {Vector3} from "../../../../3party/three/build/three.module.js";

const pA = {
    mass:5,
    pos: new Vector3(10,0,0),
    vel: new Vector3(0,0,-0.15),
    color: 0xffffff,
    trailLength: 3000,
}

const pB = {
    mass:5,
    pos: new Vector3(-10,0,0),
    vel: new Vector3(0,0,0.15),
    color: 0xd96493,
    trailLength: 3000,
}

const pC = {
    mass:0.5,
    pos: new Vector3(0,42,0),
    vel: new Vector3(0,0,0),
    color: 0x32a852,
    trailLength: 3000,
}

export {pA, pB, pC};
