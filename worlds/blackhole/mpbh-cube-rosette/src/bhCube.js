import { Vector3} from "../../../../3party/three/build/three.module.js";

let mass = 5;
let size = 2;

let nnn = {
    mass:mass,
    pos: new Vector3(-1,-1,-1).multiplyScalar(size),
};

let nnp = {
    mass:mass,
    pos: new Vector3(-1,-1,1).multiplyScalar(size),
};

let npn = {
    mass:mass,
    pos: new Vector3(-1,1,-1).multiplyScalar(size),
};

let pnn = {
    mass:mass,
    pos: new Vector3(1,-1,-1).multiplyScalar(size),
};

let ppn = {
    mass:mass,
    pos: new Vector3(1,1,-1).multiplyScalar(size),
};

let npp = {
    mass:mass,
    pos: new Vector3(-1,1,1).multiplyScalar(size),
};

let pnp = {
    mass:mass,
    pos: new Vector3(1,-1,1).multiplyScalar(size),
};

let ppp = {
    mass:mass,
    pos: new Vector3(1,1,1).multiplyScalar(size),
};


let bhCube = [nnn, nnp, npn, pnn, ppn, pnp, npp, ppp ];

export default bhCube;
