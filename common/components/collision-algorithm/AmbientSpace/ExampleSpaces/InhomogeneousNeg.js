import {
    Matrix3,
    SphereBufferGeometry,
    BoxBufferGeometry,
    Vector3
} from  "../../../../../3party/three/build/three.module.js";

import {randomVec3Ball, randomVec3Sphere} from "../../utils/random.js";
import {State} from "../../Computation/State.js";

import { Geometry } from "../Components/Geometry.js";
import {Model} from "../Components/Model.js";
import {Obstacle} from "../Components/Obstacle.js";

import {AmbientSpace} from "../AmbientSpace.js";





// -------------------------------------------------------------
//This is an INHOMOGENEOUS geometry on R3 that has an explicit distance function
//Found on https://mathoverflow.net/questions/37651/riemannian-surfaces-with-an-explicit-distance-function
//The metric's curvature in any totally geodesic 2-plane is
// K = -4/(2+r^2)^3
// -------------------------------------------------------------






// -------------------------------------------------------------
//some geometry stuff:
// -------------------------------------------------------------


//this metric is conformal to the Euclidean plane
//so, its defined by a conformal factor
function conformalFactor(pos){
    let len2 = pos.lengthSq();
    return  2+len2;
}

let metricTensor = function(pos){
    //just multiply the identity by the conformal factor
    let scale = conformalFactor(pos);
    return new Matrix3().identity().multiplyScalar(scale);
}


//an auxilary function to compute the distance:

function fAux(x){
    let sqrt2 = Math.sqrt(2);
    return Math.asinh(x/sqrt2) + x*Math.sqrt(x*x+2)/2;
}


let distance = function(p,q){

    let u = p.clone().add(q).length();
    let v = p.clone().sub(q).length();

    let avg = (u+v)/2;
    let diff = (u-v)/2;

    return fAux(avg)-fAux(diff);
}



let christoffel = function(state){

    let pos = state.pos.clone();
    let x = pos.x;
    let y = pos.y;
    let z = pos.z;

    let vel = state.vel.clone();
    let xP = vel.x;
    let yP = vel.y;
    let zP = vel.z;

    let xP2 = xP*xP;
    let yP2 = yP*yP;
    let zP2 = zP*zP;

    let denom = conformalFactor(pos);

    let xPP = x * ( xP2 - yP2 - zP2 ) + 2 * xP * ( y*yP + z*zP );
    let yPP = y * ( yP2 - xP2 - zP2 ) + 2 * yP * ( x*xP + z*zP );
    let zPP = z * ( zP2 - xP2 - yP2 ) + 2 * zP * ( x*xP + y*yP );

    let acc =  new Vector3(xPP,yPP,zPP).divideScalar(-1*denom);

    return acc;
}


let space = new Geometry(
    distance,
    metricTensor,
    christoffel);





// -------------------------------------------------------------
//model of Euclidean space : do nothing
// -------------------------------------------------------------

//the coordinates are directly R3!
//though, we have the option to scale it up
let zoom = 0.6;

let coordsToModel= function(coords){
    return coords.clone().multiplyScalar(zoom);
}

//the scaling factor is computed from the metric tensor:
//this metric tensor is conformal so its easy: sqrt(conformalCoef)

let modelScaling = function(modelPos){

    //unscale position back to true Poincare ball:
    let coordPos = modelPos.clone().divideScalar(zoom);
    let scale = conformalFactor(coordPos);
    return zoom/Math.sqrt(Math.abs(scale));

}

let model = new Model(coordsToModel, modelScaling);




// -------------------------------------------------------------
//obstacles to contain balls in Euclidean Space
// -------------------------------------------------------------

//distance to the origin is calculable by an explicit function
//distTo0(p)= fAux(|p|);

//a sphere of radius R
let coordSize = 5.;
let sphereSize = fAux(coordSize);


//the metric is spherically symmetric; so measuring the distance to some level set of a sphere in Euc coordinates
//is a metric sphere!
let distToSphere = function(pos){
    let center = new Vector3(0,0,0);
    let dist =  distance(pos,center);
    return sphereSize - dist;
}

let sphereGeom = new SphereBufferGeometry(zoom*coordSize, 64,32);

let generateState = function(){
    let pos = randomVec3Sphere(0.5*coordSize);
    let vel = randomVec3Ball(1).divideScalar(conformalFactor(pos));
    return new State(pos,vel);
}


let obstacle = new Obstacle(
    distToSphere,
    sphereGeom,
    sphereSize,
    generateState
);






//package stuff up for export
let inhomogeneousNeg = new AmbientSpace( space, model, obstacle);

export { inhomogeneousNeg };
