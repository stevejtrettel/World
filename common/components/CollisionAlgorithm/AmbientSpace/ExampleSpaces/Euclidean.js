import {
    Matrix3,
    SphereBufferGeometry,
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

let eucModel = new Model();



let distToObstacle = function(pos){
    return 6.-pos.length();
}

let obstacleGeometry = new SphereBufferGeometry(6,64,32);

let eucObstacle = new Obstacle(
    distToObstacle,
    obstacleGeometry
);









//package stuff up for export
let euclidean = new AmbientSpace( eucSpace, eucModel, eucObstacle);


console.log(euclidean.obstacle.distance);

export { euclidean };
