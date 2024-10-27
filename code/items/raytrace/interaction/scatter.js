
import {randomVec3Sphere} from "./random.js";
import TVec from "../TVec.js";



function reflectIn(incident,normal){

    let proj = incident.dir.dot(normal.dir);
    let dir = incident.dir.clone().sub(normal.dir.clone().multiplyScalar(2. * proj));

    return new TVec(incident.pos,dir);

}

function refractIn(incident, normal, n){
    //n is the ior ratio current/entering:

    let cosX = -normal.dot(incident);
    let sinT2 = n*n*(1-cosX*cosX);

    if(sinT2>1.){//TIR
        return reflectIn(incident,normal);
    }

    let cosT= Math.sqrt(Math.abs(1.0 - sinT2));
    let v1 = incident.dir.clone().multiplyScalar(n);
    let v2 = normal.dir.clone().multiplyScalar(n*cosX - cosT);
    let dir = v1.add(v2);

    return new TVec(incident.pos,dir);
}



//
//
//
// function mix(vec1, vec2, t){
//     //convex combo of the TVecs
//     let v1 = vec1.clone().multiplyScalar(t);
//     let v2 = vec2.clone().multiplyScalar(1-t);
//     let newVec = v1.add(v2);
//     return newVec;
// }
//
//
//
//
// function scatterDiffuse(incident,obj){
//
//     let normal = obj.getNormal(incident.pos);
//     let randomVec = new TVec(incident.pos,new randomVec3Sphere());
//     let diffuseVec = normal.add(randomVec);
//     let newTV = diffuseVec.normalize();
//
//     return newTV
// }
//
//
// function scatterSpecular(incident,obj){
//
//     //some useful stuff:
//     let normal = obj.getNormal(incident.pos);
//
//     let randomVec = new TVec(incident.pos,new randomVec3Sphere());
//     let diffuseVec = normal.add(randomVec);
//     diffuseVec.normalize();
//
//     let rough2 = obj.mat.roughness*obj.mat.roughness;
//     let reflectVec = reflectIn(incident,normal);
//
//
//     let newTV = mix(diffuseVec,reflectVec,rough2);
//     newTV.normalize();
//
//     return newTV;
//
// }
//
//
// function scatterRefract(incident,obj){
//
//     //some useful stuff:
//     let normal = obj.getNormal(incident.pos);
//     let randomVec = new TVec(incident.pos,new randomVec3Sphere());
//     let diffuseVec = normal.add(randomVec);
//     diffuseVec.normalize();
//     //inward pointing scattering this time
//     diffuseVec.multiplyScalar(-1);
//
//     let rough2 = obj.mat.roughness*obj.mat.roughness;
//     let refractVec = refractIn(incident,normal,obj.ior);
//
//     let newTV = mix(diffuseVec,refractVec,rough2);
//     newTV.normalize();
//
//     return newTV;
//
// }



export {reflectIn, refractIn};
