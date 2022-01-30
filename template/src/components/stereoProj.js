import {
    MeshPhysicalMaterial,
    PlaneBufferGeometry,
    Mesh,
    DoubleSide,
    SphereBufferGeometry,
    Vector3,
    Vector2,
    CatmullRomCurve3,
} from "../../../3party/three/build/three.module.js";

import { ParametricGeometry } from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";
import {ParametricTube} from "../../../common/objects/ParametricTube.js";
import {colorConversion} from "../../../common/shaders/colors/colorConversion.js";
// import {ParametricMaterial} from "../../../common/materials/ParametricMaterial.js";
//




let params = {rad:1};
params.addToScene=(scene)=>{};
params.addToUI=(ui)=>{
    ui.add(params,'rad',0.01,1,0.01).name('Nullhomotopy');
}





const planeMatOptions = {
    clearcoat:1,
    side: DoubleSide,
   // metalness:0.85,
    roughness:0,
     color:0x1e4466,
}
const planeMat = new MeshPhysicalMaterial(planeMatOptions);
let planeGeom = new PlaneBufferGeometry(12,12);

let plane = new Mesh(planeGeom, planeMat);
plane.rotateX(3.14/2.);
plane.position.set(0,-1,0);
plane.addToScene = (scene)=>{scene.add(plane)};
plane.addToUI = (ui)=>{};








const sphereMatOptions = {
    clearcoat:1,
    side: DoubleSide,
    transmission:0.3,
    opacity:1,
    metalness:0.,
    roughness:0.1,
    color:0x1d662c,
}
const sphereMat = new MeshPhysicalMaterial(sphereMatOptions);
let sphereGeom = new SphereBufferGeometry(1,32,32)

let sphere = new Mesh(sphereGeom, sphereMat);
sphere.position.set(0,1,0);

sphere.addToScene = (scene)=>{scene.add(sphere)};
sphere.addToUI = (ui)=>{};







//material options, shaders etc for the curves:
const planeCurveOptions = {
    segments: 128,
    radius: 0.15,
    tubeRes: 32,
};
const sphCurveOptions = {
    segments: 128,
    radius: 0.075,
    tubeRes: 32,
};
let fragAux = colorConversion;

//need to make a function vec3 fragColor();
//have available as varyings vPosition, vUv and vNormal
let fragColor = `
vec3 fragColor(){
    
   vec3 baseColor = hsb2rgb(vec3(vUv.x, 0.65, 0.4));
   return baseColor;
    
}
`;

let frag = {
    aux: fragAux,
    fragColor: fragColor,
}

let options = {
    clearcoat:1,
    metalness:0.,
    roughness:0.1,
}







//general functions for stereographic projection computation:

function stereo(sphPos){
    let x = sphPos.x;
    let y = sphPos.y;
    let z = sphPos.z;

    let u = x/(1+z);
    let v = y/(1+z);

    return new Vector3(x,-1,y);
}


function sphCoords(theta,phi){
    let x = Math.cos(theta)*Math.sin(phi);
    let y = Math.sin(theta)*Math.sin(phi);
    let z = Math.cos(phi);

    return new Vector3(x,z+1,y);
}

function invStereo(planePos) {
    let u = planePos.x;
    let v = planePos.z;

    //do the inverse stereo proj with respect to y:
    let r2 = u*u+v*v;
    let denom = (9 +r2);
    let x = 6 * u / denom;
    let y = -(9-r2)/denom+1;
    let z = 6 * v / denom;

    return new Vector3(x, y, z);
}



function straightLine(start, end, s){

    let seg = end.clone().sub(start);
    return start.clone().add(seg.multiplyScalar(s));
}









//making the actual curve on the plane:
function planePos(t,time){

    let centerR = new Vector2(Math.cos(3.*time/5),Math.sin(4*time/5)).multiplyScalar(3);

    let r = 1+0.3*Math.cos(3*t)*Math.sin(time)+0.1*Math.cos(5*t)*Math.sin(time/2);
    let x = params.rad*(r+0.5*Math.cos(time/3))*Math.cos(t)+centerR.x;
    let z = params.rad*r*Math.sin(t)+centerR.y;
    let y = -1;

    return new Vector3(x,y,z);
}











//the curve which lies on the sphere

function createSphereCurve(time){
    let pts = [];

    for(let i=0; i<101; i++){
        let t = 6.3*i/100;

        let v = invStereo(planePos(t,time));
        pts.push(v.clone());
    }
    return new CatmullRomCurve3(pts);
}


let sphereTube = new ParametricTube(createSphereCurve(0),sphCurveOptions,frag, {}, options);
sphereTube.addToUI = (ui)=>{};
sphereTube.tick = (time, dTime) => {
    let newCurve = createSphereCurve(time);
    sphereTube.resetCurve(newCurve);
};







//the curve which lies on the plane

function createPlaneCurve(time){
    let pts = [];
    for(let i=0; i<101; i++){
        let t = 6.3*i/100;
        let v = planePos(t,time);
        pts.push(v.clone());
    }
    return new CatmullRomCurve3(pts);
}


let planeTube = new ParametricTube(createPlaneCurve(0),planeCurveOptions,frag, {}, options);
planeTube.addToUI = (ui)=>{};
planeTube.tick = (time, dTime) => {
    let newCurve = createPlaneCurve(time);
    planeTube.resetCurve(newCurve);
};






//stereographic projection surface:
function createSurfaceGeometry(time) {

    let func = (u,v,dest) => {
        const t = 6.3*u;
        const s = v;

        const plane = planePos(t,time);
        const sph = invStereo(plane);

        const val = straightLine(plane,sph,s);
        dest.set(val.x,val.y,val.z);
    }

    const geometry = new ParametricGeometry(func,50,50);

    return geometry;

}


const surfaceMatOptions = {
    clearcoat:1,
    clearcoatFactor:3,
    side: DoubleSide,
    transmission:0.9,
    opacity:1,
    metalness:0.,
    roughness:0,
}
const surfaceMat = new MeshPhysicalMaterial(surfaceMatOptions);
const surface = new Mesh(createSurfaceGeometry(0), surfaceMat);
surface.addToScene = (scene)=>{scene.add(surface)};
surface.addToUI=(ui)=>{};
surface.tick = (time,dTime)=>{
    surface.geometry.dispose();
    surface.geometry = createSurfaceGeometry(time);
}






//portion of surface inside the sphere

//stereographic projection surface:
function createInsideSurfaceGeometry(time) {

    let func = (u,v,dest) => {
        const t = 6.3*u;
        const s = v;

        const plane = planePos(t,time);
        const sph = invStereo(plane);
        const pole = new Vector3(0,2,0);

        const val = straightLine(sph,pole,s);
        dest.set(val.x,val.y,val.z);
    }

    const geometry = new ParametricGeometry(func,50,50);

    return geometry;

}


const insideSurfaceMatOptions = {
    clearcoat:1,
    clearcoatFactor:3,
    side: DoubleSide,
    metalness:0.,
    roughness:0,
}
const insideSurfaceMat = new MeshPhysicalMaterial(insideSurfaceMatOptions);
const insideSurface = new Mesh(createInsideSurfaceGeometry(0), insideSurfaceMat);
insideSurface.addToScene = (scene)=>{scene.add(insideSurface)};
insideSurface.addToUI=(ui)=>{};
insideSurface.tick = (time,dTime)=>{
    insideSurface.geometry.dispose();
    insideSurface.geometry = createInsideSurfaceGeometry(time);
}








let stereoProj = {
    params:params,
    plane: plane,
    sphere:sphere,
    planeTube:planeTube,
    sphereTube:sphereTube,
    surface:surface,
    insideSurface:insideSurface,
}


export{ stereoProj };
