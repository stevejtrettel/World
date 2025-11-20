import { Vector3,Color} from "../../../../3party/three/build/three.module.js";

let mass = 5;
let size = 2;

let e1 = {
    mass:mass,
    pos: new Vector3(1,0,0).multiplyScalar(size),
    color: new Color().setRGB(1,0,0),
};

let e2 = {
    mass:mass,
    pos: new Vector3(0,1,0).multiplyScalar(size),
    color: new Color().setRGB(0,1,0),
};

let e3 = {
    mass:mass,
    pos: new Vector3(0,0,1).multiplyScalar(size),
    color: new Color().setRGB(0,0,1),
};

let n1 = {
    mass:mass,
    pos: new Vector3(-1,0,0).multiplyScalar(size),
    color: new Color().setRGB(0,0.5,0.5),
};

let n2 = {
    mass:mass,
    pos: new Vector3(0,-1,0).multiplyScalar(size),
    color: new Color().setRGB(0.5,0,0.5),
};

let n3 = {
    mass:mass,
    pos: new Vector3(0,0,-1).multiplyScalar(size),
    color: new Color().setRGB(0.5,0.5,0),
};



let bhOctahedron = [ e1,e2,e3,n1,n2,n3 ];

export default bhOctahedron;
