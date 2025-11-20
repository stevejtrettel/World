import { Vector3} from "../../../../3party/three/build/three.module.js";

let mass = 0.2;
let size = 0.1;



let bhLine = [];
let N=30;
for(let i= -N;i<N+1;i++){
    let bh = {
        mass:mass,
        pos: new Vector3(0,i,0).multiplyScalar(size),
    }
    bhLine.push(bh);
}

export default bhLine;
