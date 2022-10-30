import {
    Matrix3,
    SphereBufferGeometry,
    Vector3,
    Vector4
} from "../../../../../3party/three/build/three.module.js";

import { Geometry } from "../Components/Geometry.js";
import {Model} from "../Components/Model.js";
import {Obstacle} from "../Components/Obstacle.js";

import {AmbientSpace} from "../AmbientSpace.js";

// -------------------------------------------------------------
//some spherical geometry stuff:
// -------------------------------------------------------------

//distance on the sphere:
function threeSphereDistance(u,v){
    return Math.acos(Math.abs(u.clone().dot(v)));
}





//coordinates mapping onto the hyperboloid model of H3
function coords(pos){

    let rho = pos.x;
    let gamma = pos.y;
    let omega = pos.z;

    let x = Math.sin(rho);
    let y = Math.cos(rho)*Math.sin(gamma);
    let z = Math.cos(rho)*Math.cos(gamma)*Math.sin(omega);
    let w = Math.cos(rho)*Math.cos(gamma)*Math.cos(omega);

    return new Vector4(x,y,z,w);
}






let sphMetricTensor = function(pos){

    let rho = pos.x;
    let gamma = pos.y;
    let omega = pos.z;

    let cos2rho = Math.cos(rho)*Math.cos(rho);
    let cos2gamma = Math.cos(gamma)*Math.cos(gamma)

    let g11 = 1.;
    let g22 = cos2rho;
    let g33 = cos2rho*cos2gamma;

    return new Matrix3().set(
        g11,0,0,
        0,g22,0,
        0,0,g33
    );


}

let sphDistance = function(pos1, pos2){

    let u = coords(pos1);
    let v = coords(pos2);

    return threeSphereDistance(u,v);
}



let sphChristoffel = function(state){

    let pos = state.pos;
    let vel = state.vel;

    let rho = pos.x;
    let gamma = pos.y;
    let omega = pos.z;

    let rhoP = vel.x;
    let gammaP = vel.y;
    let omegaP = vel.z;

    let rhoPP = -Math.cos(rho)*Math.sin(rho)*(gammaP*gammaP+Math.cos(gamma)*Math.cos(gamma)*omegaP*omegaP);
    let gammaPP = -Math.cos(gamma)*Math.sin(gamma)*omegaP*omegaP + 2*Math.tan(rho)*gammaP*rhoP;
    let omegaPP = 2*omegaP*(gammaP*Math.tan(gamma)+rhoP*Math.tan(rho));

    let acc = new Vector3(rhoPP, gammaPP, omegaPP);

    return acc;

}


let sphSpace = new Geometry(
    sphDistance,
    sphMetricTensor,
    sphChristoffel
);





// -------------------------------------------------------------
//model of Euclidean space : do nothing
// -------------------------------------------------------------

//scale of the model on the screen
const modelScale = 0.7;


let stereoProj = function(coord){

    let p = coords(coord);

    let x = p.x;
    let y = p.y;
    let z = p.z;
    let w = p.w;

    let scale = modelScale/(1-w);

    return new Vector3(x,y,z).multiplyScalar(scale);
}


let stereoScaling = function(pos){
    let len2 = pos.clone().lengthSq();
    let scale = Math.sqrt(modelScale*modelScale + len2);
    return scale/(modelScale*modelScale);
}

let sphModel = new Model(stereoProj,stereoScaling);




// -------------------------------------------------------------
//obstacles to contain balls in Euclidean Space
// -------------------------------------------------------------

//a sphere of a fixed radius
let obstacleSize = 1.5;

let distToSphere = function(pos){
    //center point of H3 in coordinates:
    let center = new Vector3(0,0,0);
    //distance from center to position
    let dist = sphDistance(pos,center);
    //how far is this from the boundary sphere of radius 5?
    return obstacleSize - dist;
}


let rad = modelScale * Math.tan(obstacleSize);

let sphereGeom = new SphereBufferGeometry(rad, 64, 32);

let sphereObstacle = new Obstacle(
    distToSphere,
    sphereGeom
);







//package stuff up for export
let spherical = new AmbientSpace( sphSpace, sphModel, sphereObstacle);

export { spherical };


