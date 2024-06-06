import {
    MeshPhysicalMaterial,
    PlaneBufferGeometry,
    TubeBufferGeometry,
    Mesh,
    DoubleSide,
    SphereBufferGeometry,
    Vector3,
    Vector2,
    CatmullRomCurve3,
    Group,
} from "../../../3party/three/build/three.module.js";

import { ParametricGeometry } from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";
import {ParametricTube} from "../../compute/materials/ParametricTube.js";
import {colorConversion} from "../../shaders/colors/colorConversion.js";
// import {ParametricMaterial} from "../../../common/materials/ParametricMaterial.js";
//








const planeMatOptions = {
    clearcoat:1,
    side: DoubleSide,
    // metalness:0.85,
    //color:0x1e4466,
    color:0x878787,
    roughness:0.5,
}
const planeMat = new MeshPhysicalMaterial(planeMatOptions);
let planeGeom = new PlaneBufferGeometry(18,18);

let plane = new Mesh(planeGeom, planeMat);
plane.rotateX(3.14/2.);
plane.position.set(0,-1,0);
plane.addToScene = (scene)=>{scene.add(plane)};
plane.addToUI = (ui)=>{};








const sphereMatOptions = {
    clearcoat:1,
    side: DoubleSide,
    transmission:0.5,
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




//general functions for stereographic projection computation:

function stereo(sphPos){
    let x = sphPos.x;
    let y = sphPos.y-1;
    let z = sphPos.z;


    let u = -x/(y-1);
    let v = -z/(y-1);

    let pt = new Vector3(u,0,v);
    pt.multiplyScalar(3);
    pt.add(new Vector3(0,-1,0));
    return pt;
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









//make the cube edges:
let sphCubeMat = new MeshPhysicalMaterial({
    side: DoubleSide,
    color:0xa11313,
    clearcoat:1,
    metalness:0.5,
    roughness:0.1,
});
let geo;
let sphCube = new Group();
let path;

function makeEdge(start, dir, proj) {

    let pts = [];
    let point, sphPt, stereoPt;
    for (let i = 0; i < 51; i++) {

        //get the coordinate between -1 and 1
        let t = 2 * i / 50 - 1;

        //edge through origin:
        sphPt = dir.clone().multiplyScalar(t);

        //shift to the right location
        sphPt.add(start);

        //normalize to lie on the sphere:
        sphPt.normalize();

        //shift up to the correct sphere:
        sphPt.add(new Vector3(0,1,0));

        //now do the stereographic projection of this to find location on plane:
        stereoPt=stereo(sphPt);

        //interpolate between these:
        point = straightLine(sphPt,stereoPt,proj);

        pts.push(point);
    }
    return new CatmullRomCurve3(pts);
}





//BUILD UP THE CUBE:
function buildCube(sphCube) {

    path = makeEdge(new Vector3(1, 0, 1), new Vector3(0, 1, 0), 0.);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    let edge1 = new Mesh(geo, sphCubeMat);
    edge1.name='E1';
    sphCube.add(edge1);


    path = makeEdge(new Vector3(-1, 0, 1), new Vector3(0, 1, 0), 0.);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    let edge2 = new Mesh(geo, sphCubeMat);
    edge2.name='E2';
    sphCube.add(edge2);


    path = makeEdge(new Vector3(1, 0, -1), new Vector3(0, 1, 0), 0.);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    let edge3 = new Mesh(geo, sphCubeMat);
    edge3.name='E3';
    sphCube.add(edge3);

    path = makeEdge(new Vector3(-1, 0, -1), new Vector3(0, 1, 0), 0.);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    let edge4 = new Mesh(geo, sphCubeMat);
    edge4.name='E4';
    sphCube.add(edge4);






    path = makeEdge(new Vector3(0, 1, 1), new Vector3(1, 0, 0), 0.);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    let edge5 = new Mesh(geo, sphCubeMat);
    edge5.name='E5';
    sphCube.add(edge5);


    path = makeEdge(new Vector3(0,1,-1), new Vector3(1, 0, 0), 0.);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    let edge6 = new Mesh(geo, sphCubeMat);
    edge6.name='E6';
    sphCube.add(edge6);


    path = makeEdge(new Vector3(1, 1, 0), new Vector3(0, 0, 1), 0.);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    let edge7 = new Mesh(geo, sphCubeMat);
    edge7.name='E7';
    sphCube.add(edge7);

    path = makeEdge(new Vector3(-1, 1, 0), new Vector3(0, 0, 1), 0.);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    let edge8 = new Mesh(geo, sphCubeMat);
    edge8.name='E8';
    sphCube.add(edge8);





    path = makeEdge(new Vector3(0, -1, 1), new Vector3(1, 0, 0), 0.);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    let edge9 = new Mesh(geo, sphCubeMat);
    edge9.name='E9';
    sphCube.add(edge9);


    path = makeEdge(new Vector3(0,-1,-1), new Vector3(1, 0, 0), 0.);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    let edge10 = new Mesh(geo, sphCubeMat);
    edge10.name='E10';
    sphCube.add(edge10);


    path = makeEdge(new Vector3(1, -1, 0), new Vector3(0, 0, 1), 0.);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    let edge11 = new Mesh(geo, sphCubeMat);
    edge11.name='E11';
    sphCube.add(edge11);

    path = makeEdge(new Vector3(-1, -1, 0), new Vector3(0, 0, 1), 0.);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    let edge12 = new Mesh(geo, sphCubeMat);
    edge12.name='E12';
    sphCube.add(edge12);

}








//BUILD UP THE CUBE:
function updateCube(cube,proj) {

    let geo,path;

    path = makeEdge(new Vector3(1, 0, 1), new Vector3(0, 1, 0), proj);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    cube.getObjectByName('E1').geometry.dispose();
    cube.getObjectByName('E1').geometry=geo;


    path = makeEdge(new Vector3(-1, 0, 1), new Vector3(0, 1, 0), proj);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    cube.getObjectByName('E2').geometry.dispose();
    cube.getObjectByName('E2').geometry=geo;



    path = makeEdge(new Vector3(1, 0, -1), new Vector3(0, 1, 0), proj);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    cube.getObjectByName('E3').geometry.dispose();
    cube.getObjectByName('E3').geometry=geo;


    path = makeEdge(new Vector3(-1, 0, -1), new Vector3(0, 1, 0), proj);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    cube.getObjectByName('E4').geometry.dispose();
    cube.getObjectByName('E4').geometry=geo;







    path = makeEdge(new Vector3(0, 1, 1), new Vector3(1, 0, 0), proj);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    cube.getObjectByName('E5').geometry.dispose();
    cube.getObjectByName('E5').geometry=geo;


    path = makeEdge(new Vector3(0,1,-1), new Vector3(1, 0, 0), proj);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    cube.getObjectByName('E6').geometry.dispose();
    cube.getObjectByName('E6').geometry=geo;


    path = makeEdge(new Vector3(1, 1, 0), new Vector3(0, 0, 1), proj);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    cube.getObjectByName('E7').geometry.dispose();
    cube.getObjectByName('E7').geometry=geo;

    path = makeEdge(new Vector3(-1, 1, 0), new Vector3(0, 0, 1), proj);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    cube.getObjectByName('E8').geometry.dispose();
    cube.getObjectByName('E8').geometry=geo;





    path = makeEdge(new Vector3(0, -1, 1), new Vector3(1, 0, 0), proj);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    cube.getObjectByName('E9').geometry.dispose();
    cube.getObjectByName('E9').geometry=geo;


    path = makeEdge(new Vector3(0,-1,-1), new Vector3(1, 0, 0), proj);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    cube.getObjectByName('E10').geometry.dispose();
    cube.getObjectByName('E10').geometry=geo;


    path = makeEdge(new Vector3(1, -1, 0), new Vector3(0, 0, 1), proj);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    cube.getObjectByName('E11').geometry.dispose();
    cube.getObjectByName('E11').geometry=geo;

    path = makeEdge(new Vector3(-1, -1, 0), new Vector3(0, 0, 1), proj);
    geo = new TubeBufferGeometry(path, 64, 0.1, 8, false);
    cube.getObjectByName('E12').geometry.dispose();
    cube.getObjectByName('E12').geometry=geo;

}











//ASSEMBLE THE CUBE

buildCube(sphCube);
sphCube.addToScene = (scene)=>{scene.add(sphCube)};
sphCube.tick = (time, dTime)=>{updateCube(sphCube,(1-Math.cos(time))/2)};
sphCube.addToUI = (ui)=>{};












let stereoCube = {
  //  params:params,
    plane: plane,
    sphere:sphere,
    sphCube:sphCube,
    // planeTube:planeTube,
    // sphereTube:sphereTube,
    // surface:surface,
    // insideSurface:insideSurface,
}


export default stereoCube;
