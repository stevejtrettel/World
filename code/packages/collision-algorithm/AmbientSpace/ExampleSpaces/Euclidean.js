import {
    Matrix3,
    SphereBufferGeometry,
    BoxBufferGeometry,
    Vector3
} from "../../../../../3party/three/build/three.module.js";

import { Geometry } from "../Components/Geometry.js";
import {Model} from "../Components/Model.js";
import {Obstacle} from "../Components/Obstacle.js";

import {AmbientSpace} from "../AmbientSpace.js";

import {randomVec3Ball} from "../../utils/random.js";
import {State} from "../../Computation/State.js";

// -------------------------------------------------------------
//some euclidean geometry stuff:
// -------------------------------------------------------------


let eucMetricTensor = function(pos){
    return new Matrix3().identity();
}

let eucDistance = function(pos1, pos2){
    return pos1.clone().sub(pos2).length()
}

let eucChristoffel = function(state){
    return new Vector3(0,0,0);
}


let eucSpace = new Geometry(
    eucDistance,
    eucMetricTensor,
    eucChristoffel);





// -------------------------------------------------------------
//model of Euclidean space : do nothing
// -------------------------------------------------------------


let identityR3= function(coords){
    return coords;
}

let unitScaling = function(pos){
    return 1.;
}

let eucModel = new Model(identityR3,unitScaling);





// -------------------------------------------------------------
//obstacles to contain balls in Euclidean Space
// -------------------------------------------------------------

//a sphere
let R = 6.;

let distToSphere = function(pos){
    return R-pos.length();
}
let sphereGeom = new SphereBufferGeometry(R,64,32);

let generateSphState = function(){
    let pos = randomVec3Ball(0.8*R);
    let vel = randomVec3Ball(1);
    return new State(pos,vel);
}


let sphereObstacle = new Obstacle(
    distToSphere,
    sphereGeom,
    R,
    generateSphState
);







//a box

let distToBox = function(pos){
    let xWall = 6 - Math.abs(pos.x);
    let yWall = 4. - Math.abs(pos.y);
    let zWall = 4 - Math.abs(pos.z);

    return Math.min(xWall,Math.min(yWall,zWall));

}

let boxGeom = new BoxBufferGeometry(12,8,8);

let boxSize = 6.;

let generateBoxState = function(){
    let x = 6.*Math.random()-6;
    let y = 4.*Math.random()-4;
    let z = 4.*Math.random()-4;
    let pos = new Vector3(x,y,z).multiplyScalar(0.8);
    let vel = randomVec3Ball(1);
    return new State(pos,vel);
}



let boxObstacle = new Obstacle(
    distToBox,
    boxGeom,
    boxSize,
    generateBoxState,
);






//package stuff up for export
let euclidean = new AmbientSpace( eucSpace, eucModel, sphereObstacle);

export { euclidean };
