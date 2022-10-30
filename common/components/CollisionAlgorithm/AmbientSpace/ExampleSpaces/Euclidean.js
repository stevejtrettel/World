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

let distToSphere = function(pos){
    return 6.-pos.length();
}
let sphereGeom = new SphereBufferGeometry(6,64,32);

let sphereObstacle = new Obstacle(
    distToSphere,
    sphereGeom
);



//a box

let distToBox = function(pos){
    let xWall = 6 - Math.abs(pos.x);
    let yWall = 4. - Math.abs(pos.y);
    let zWall = 4 - Math.abs(pos.z);

    return Math.min(xWall,Math.min(yWall,zWall));

}

let boxGeom = new BoxBufferGeometry(12,8,8);

let boxObstacle = new Obstacle(
    distToBox,
    boxGeom
);






//package stuff up for export
let euclidean = new AmbientSpace( eucSpace, eucModel, boxObstacle);

export { euclidean };
