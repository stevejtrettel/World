
//actually building one of these
import {Vector3} from "../../../3party/three/build/three.module.js";

const pA = {
    mass:2,
    pos: new Vector3(5,30,0),
    vel: new Vector3(0,0,-0.25),
    color: 0xffffff,
    trailLength: 3000,
}

const pB = {
    mass:2,
    pos: new Vector3(-5,30,0),
    vel: new Vector3(0,0,0.25),
    color: 0xd96493,
    trailLength: 3000,
}

const pC = {
    mass:0.5,
    pos: new Vector3(11,0,0),
    vel: new Vector3(0,0,0),
    color: 0x32a852,
    trailLength: 3000,
}

const pD = {
    mass:2,
    pos: new Vector3(0,-30,2),
    vel: new Vector3(-1,0,0),
    color: 0xb88c40,
    trailLength: 3000,
}

const pE = {
    mass:2,
    pos: new Vector3(0,-30,-2),
    vel: new Vector3(1,0,0),
    color: 0x4a2a5c,
    trailLength: 3000,
}

export {pA, pB, pC, pD, pE};
