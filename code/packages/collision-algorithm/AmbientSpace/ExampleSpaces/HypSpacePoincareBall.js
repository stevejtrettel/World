import {
    Matrix3,
    SphereGeometry,
    BoxBufferGeometry,
    Vector3,
    Vector4
} from "../../../../../3party/three/build/three.module.js";

import {
    randomVec3Ball,
    randomVec3Sphere
} from "../../utils/random.js";

import {State} from "../../Computation/State.js";

import { Geometry } from "../Components/Geometry.js";
import {Model} from "../Components/Model.js";
import {Obstacle} from "../Components/Obstacle.js";

import {AmbientSpace} from "../AmbientSpace.js";





function minkowskiDot(u,v){
    return u.w*v.w - ( u.x*v.x + u.y*v.y + u.z*v.z );
}

//distance on hyperboloid:
function hyperboloidDistance(u,v){
    return Math.acosh(Math.abs(minkowskiDot(u,v)));
}


//map from poincare ball to the hyperboloid:
function toHyperboloid(pos){

    let len2 = pos.lengthSq();
    let w = 1 + len2;
    let p = new Vector4(2.*pos.x,2.*pos.y,2.* pos.z,w).divideScalar(1-len2);

    return p;
}




// -------------------------------------------------------------
//some geometry stuff:
// -------------------------------------------------------------


//this metric is conformal to the Euclidean plane
//so, its defined by a conformal factor
function conformalFactor(pos){

    let r2 = pos.lengthSq();
    let diff = 1-r2;
    let diff2 = diff*diff;

    return  4./(diff2);
}



let metricTensor = function(pos){

    //just multiply the identity by the conformal factor
    let scale = conformalFactor(pos);
    return new Matrix3().identity().multiplyScalar(scale);
}


let distance = function(pos1,pos2){

    let u = toHyperboloid(pos1);
    let v = toHyperboloid(pos2);
    return hyperboloidDistance(u,v);

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

    let denom = pos.lengthSq()-1.;

    let xPP = 2*x * ( xP2 - yP2 - zP2 ) + 4 * xP * ( y*yP + z*zP );
    let yPP = 2*y * ( yP2 - xP2 - zP2 ) + 4 * yP * ( x*xP + z*zP );
    let zPP = 2*z * ( zP2 - xP2 - yP2 ) + 4 * zP * ( x*xP + y*yP );

    let acc =  new Vector3(xPP,yPP,zPP).divideScalar(denom);

    return acc;
}


let space = new Geometry(
    distance,
    metricTensor,
    christoffel);





// -------------------------------------------------------------
//model of Euclidean space : do nothing
// -------------------------------------------------------------

//there is no model for this space: its a metric directly on R3!
//though, its all drawn inside of a unit ball: so let's scale it up

let zoom = 6.;

let coordsToModel= function(coords){
    return coords.clone().multiplyScalar(zoom);
}

//the scaling factor is computed from the metric tensor:
//this metric tensor is conformal so its easy: sqrt(conformalCoef)

let modelScaling = function(modelPos){

    //unscale position back to true Poincare ball:
    let coordPos = modelPos.clone().divideScalar(zoom);
    let scale = conformalFactor(coordPos);
    return zoom/Math.sqrt(scale);

}

let model = new Model(coordsToModel, modelScaling);




// -------------------------------------------------------------
//obstacles to contain balls in Euclidean Space
// -------------------------------------------------------------

//a sphere of radius R
let coordSize = 0.8;
let sphereSize = distance(new Vector3(0,0,0), new Vector3(coordSize,0,0));

//the metric distance to the origin of the poincare disk is the arctanh of the norm:
let distToSphere = function(pos){
    let center = new Vector3(0,0,0);
    let dist =  distance(pos,center);
    return sphereSize - dist;
}

let sphereGeom = new SphereGeometry(zoom * coordSize, 64,32);

let generateState = function(){

    let pos = randomVec3Sphere(0.5*coordSize);
    let vel = randomVec3Ball(3).divideScalar(conformalFactor(pos));
    return new State(pos,vel);
}


let obstacle = new Obstacle(
    distToSphere,
    sphereGeom,
    sphereSize,
    generateState
);





//package stuff up for export
let hyperbolic = new AmbientSpace( space, model, obstacle);

export { hyperbolic };
