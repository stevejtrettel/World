import { Vector3,Color} from "../../../../3party/three/build/three.module.js";

let mass = 5;
let size = 2;

let e1 = {
    mass:mass,
    pos: new Vector3(0,1,0).multiplyScalar(size),
    color: new Color().setRGB(1,0,0),
};

let e2 = {
    mass:mass,
    pos: new Vector3(0,-1,0).multiplyScalar(size),
    color: new Color().setRGB(0,1,0),
};


let bhBinary = [ e1,e2 ];

export default bhBinary;
