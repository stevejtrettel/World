import { Vector3} from "../../../../3party/three/build/three.module.js";

let mass = 1;
let size = 5;

let v1 = {
    mass:mass,
    pos: new Vector3(1,-1,0).multiplyScalar(size),
};

let v2 = {
    mass:mass,
    pos: new Vector3(-1,-1,0).multiplyScalar(size),
};

let v3 = {
    mass:mass,
    pos: new Vector3(1,1,0).multiplyScalar(size),
};


let bhTriangle = [ v1, v2, v3 ];

export default bhTriangle;
