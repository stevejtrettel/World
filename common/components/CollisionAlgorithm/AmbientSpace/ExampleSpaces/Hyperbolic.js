import {
    Matrix3,
    Vector3
} from "../../../../../3party/three/build/three.module.js";



import { Geometry } from "../Components/Geometry.js";
import { Model } from "../Components/Model.js";
import { Obstacle } from "../Components/Obstacle.js";

import { AmbientSpace } from "../AmbientSpace.js";






// -------------------------------------------------------------
//some hyperbolic geometry stuff:
// -------------------------------------------------------------
//right now using a metric tensor that is SINGULAR at the origin
//leading to lots of numerical precision loss


let hypMetricTensor = function(pos){

    let a = pos.x;
    let b = pos.y;

    let sinh2a = Math.sinh(a)*Math.sinh(a);
    let sinh2b = Math.sinh(b)*Math.sinh(b);

    let gaa = 1.;
    let gbb = sinh2a;
    let gcc = sinh2a*sinh2b;

    return new Matrix3().set(
        gaa,0,0,
        0,gbb,0,
        0,0,gcc
    );
}

//take the derivative with the connection of a state (pos, vel)
let hypChristoffel = function(state){
    let pos = state.pos;
    let a = pos.x;
    let b = pos.y;
    let c = pos.z;

    let vel = state.vel;
    let aP = vel.x;
    let bP = vel.y;
    let cP = vel.z;

    let sinh2a = Math.sinh(2.*a);
    let cotha = 1/Math.tanh(a);
    let sin2b = Math.sin(2.*b);
    let sinb = Math.sin(b);
    let cotb = 1./Math.tan(b);

    let aPP = sinh2a/2 * (bP*bP + cP*cP * sinb*sinb);
    let bPP = 1/2*(sin2b*cP*cP-4.*aP*bP * cotha);
    let cPP = -2*(aP*cP*cotha + bP*cP * cotb);

    let acc = new Vector3(aPP, bPP, cPP);
    return acc;
}



let hypDistance = function(pos1, pos2){

    let coshA1 = Math.cosh(pos1.x);
    let sinhA1 = Math.sinh(pos1.x);

    let coshA2 = Math.cosh(pos2.x);
    let sinhA2 = Math.sinh(pos2.x);

    let cosB1 = Math.cos(pos1.y);
    let sinB1 = Math.sin(pos1.y);

    let cosB2 = Math.cos(pos2.y);
    let sinB2 = Math.sin(pos2.y);

    let cosDeltaC = Math.cos(pos1.z-pos2.z);

    let delta = coshA1*coshA2 - sinhA1 * sinhA2 * (cosB1*cosB2 + sinB1*sinB2*(cosDeltaC));
    return Math.acosh(delta);
}


let hypSpace = new Geometry(
    hypDistance,
    hypMetricTensor,
    hypChristoffel);







// -------------------------------------------------------------
//choice of an projection into R3:
// -------------------------------------------------------------



let hypProjection = new Model();








// -------------------------------------------------------------
//choice of an obstacle
// -------------------------------------------------------------
//right now confining balls to live in the interior of a sphere

let obstacleDistance = function(pos){
    //center point of H3 in coordinates:
    let center = new Vector3(0,0,0);
    //distance from center to position
    let dist = hypDistance(pos,center);
    //how far is this from the boundary sphere of radius 5?
    return 3.-dist;
}

let obstacleGeometry;

let hypObstacle = new Obstacle(obstacleDistance, obstacleGeometry);










// -------------------------------------------------------------
//package and export
// -------------------------------------------------------------
let hyperbolic = new AmbientSpace(hypSpace, hypProjection, hypObstacle);

export { hyperbolic };