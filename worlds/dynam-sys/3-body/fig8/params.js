import {Vector3} from "../../../../3party/three/build/three.module.js";



// positions: (x1,y1) = (-0.97000436, 0.24308753), (x2,y2) = (-x1, -y1), (x3,y3) = (0,0)
// velocities: (vx1,vy1) = (vx2, vy2) = -(vx3, vy3)/2; where (vx3,vy3) = (0.93240737, 0.86473146)


const pA = {
    mass:1,
    pos: new Vector3(-0.97000436, 0.24308753,0),
    vel: new Vector3(-0.93240737/2, -0.86473146/2,0),
    color: 0xffffff,
    trailLength: 3000,
}

const pB = {
    mass:1,
    pos: new Vector3(0.97000436, -0.24308753),
    vel: new Vector3(-0.93240737/2, -0.86473146/2,0),
    color: 0xd96493,
    trailLength: 3000,
}

const pC = {
    mass:1,
    pos: new Vector3(0,0,0),
    vel: new Vector3(0.93240737, 0.86473146,0),
    color: 0x32a852,
    trailLength: 3000,
}

export {pA, pB, pC};
