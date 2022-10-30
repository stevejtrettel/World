import {
    Matrix3,
    SphereBufferGeometry,
    BoxBufferGeometry,
    Vector3,
    Vector4
} from "../../../../../3party/three/build/three.module.js";

import { Geometry } from "../Components/Geometry.js";
import {Model} from "../Components/Model.js";
import {Obstacle} from "../Components/Obstacle.js";

import {AmbientSpace} from "../AmbientSpace.js";

// -------------------------------------------------------------
//some euclidean geometry stuff:
// -------------------------------------------------------------


function minkowskiDot(u,v){
    return u.w*v.w - ( u.x*v.x + u.y*v.y + u.z*v.z );
}

//distance on hyperboloid:
function hyperboloidDistance(u,v){
    return Math.acosh(Math.abs(minkowskiDot(u,v)));
}







//coordinates mapping onto the hyperboloid model of H3
function coords(pos){

    let rho = pos.x;
    let gamma = pos.y;
    let omega = pos.z;

    let x = Math.sinh(rho);
    let y = Math.cosh(rho)*Math.sinh(gamma);
    let z = Math.cosh(rho)*Math.cosh(gamma)*Math.sinh(omega);
    let w = Math.cosh(rho)*Math.cosh(gamma)*Math.cosh(omega);

    return new Vector4(x,y,z,w);
}






let hypMetricTensor = function(pos){

    let rho = pos.x;
    let gamma = pos.y;
    let omega = pos.z;

    let cosh2rho = Math.cosh(rho)*Math.cosh(rho);
    let cosh2gamma = Math.cosh(gamma)*Math.cosh(gamma)

    let g11 = 1.;
    let g22 = cosh2rho;
    let g33 = cosh2rho*cosh2gamma;

    return new Matrix3().set(
        g11,0,0,
        0,g22,0,
        0,0,g33
    );


}

let hypDistance = function(pos1, pos2){

    let u = coords(pos1);
    let v = coords(pos2);

    return hyperboloidDistance(u,v);
}

let hypChristoffel = function(state){

    let pos = state.pos;
    let vel = state.vel;

    let rho = pos.x;
    let gamma = pos.y;
    let omega = pos.z;

    let rhoP = vel.x;
    let gammaP = vel.y;
    let omegaP = vel.z;

    let rhoPP = Math.cosh(rho)*Math.sinh(rho)*(gammaP*gammaP+Math.cosh(gamma)*Math.cosh(gamma)*omegaP*omegaP);
    let gammaPP = Math.cosh(gamma)*Math.sinh(gamma)*omegaP*omegaP - 2*Math.tanh(rho)*gammaP*rhoP;
    let omegaPP = -2*omegaP*(gammaP*Math.tanh(gamma)+rhoP*Math.tanh(rho));

    let acc = new Vector3(rhoPP, gammaPP, omegaPP);

    return acc;

}


let hypSpace = new Geometry(
    hypDistance,
    hypMetricTensor,
    hypChristoffel
);





// -------------------------------------------------------------
//model of Euclidean space : do nothing
// -------------------------------------------------------------

//scale of the model on the screen
const modelScale = 6.;


let toPoincareBall = function(coord){

    let p = coords(coord);

    let x = p.x;
    let y = p.y;
    let z = p.z;
    let w = p.w;

    let scale = modelScale/(1+w);

    return new Vector3(x,y,z).multiplyScalar(scale);
}


let pbScaling = function(pos){
    let len2 = pos.clone().lengthSq();
    let scale = modelScale*modelScale - len2;
    return 2.*scale/(modelScale*modelScale);
}

let hypModel = new Model(toPoincareBall,pbScaling);




// -------------------------------------------------------------
//obstacles to contain balls in Euclidean Space
// -------------------------------------------------------------

//a sphere of a fixed radius
let obstacleSize = 3.;

let distToSphere = function(pos){
    //center point of H3 in coordinates:
    let center = new Vector3(0,0,0);
    //distance from center to position
    let dist = hypDistance(pos,center);
    //how far is this from the boundary sphere of radius 5?
    return obstacleSize - dist;
}


let rad = modelScale * Math.tanh(obstacleSize);

let sphereGeom = new SphereBufferGeometry(rad, 64, 32);

let sphereObstacle = new Obstacle(
    distToSphere,
    sphereGeom
);







//package stuff up for export
let hyperbolic = new AmbientSpace( hypSpace, hypModel, sphereObstacle);

export { hyperbolic };


