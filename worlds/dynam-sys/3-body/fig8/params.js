import {Vector3} from "../../../../3party/three/build/three.module.js";



// positions: (x1,y1) = (-0.97000436, 0.24308753), (x2,y2) = (-x1, -y1), (x3,y3) = (0,0)
// velocities: (vx1,vy1) = (vx2, vy2) = -(vx3, vy3)/2; where (vx3,vy3) = (0.93240737, 0.86473146)

let scaleLength = 8.;
let scaleMass = Math.pow(scaleLength,3);

const pA = {
    mass:1*scaleMass,
    pos: new Vector3(-0.97000436, 0.24308753,0).multiplyScalar(scaleLength),
    vel: new Vector3(-0.93240737/2, -0.86473146/2,0).multiplyScalar(scaleLength),
    color: 0xffffff,
    trailLength: 3000,
}

const pB = {
    mass:1*scaleMass,
    pos: new Vector3(0.97000436, -0.24308753).multiplyScalar(scaleLength),
    vel: new Vector3(-0.93240737/2, -0.86473146/2,0).multiplyScalar(scaleLength),
    color: 0xd96493,
    trailLength: 3000,
}

const pC = {
    mass:1*scaleMass,
    pos: new Vector3(0,0,0).multiplyScalar(scaleLength),
    vel: new Vector3(0.93240737, 0.86473146,0).multiplyScalar(scaleLength),
    color: 0x32a852,
    trailLength: 3000,
}

export {pA, pB, pC};
