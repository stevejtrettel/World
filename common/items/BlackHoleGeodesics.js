import {
    CylinderBufferGeometry,
    MeshPhysicalMaterial,
    RingBufferGeometry,
    Vector2,
    Vector3,
    Mesh,
    Group, DoubleSide,
} from "../../3party/three/build/three.module.js";

import {BlackHole} from "../components/BlackHole.js";
import { State } from "../cpu/components/State.js";
import IntegralCurveSpray from "../components/odes/IntegralCurveSpray-Traditional.js";



let bh = new BlackHole(0.5,0.05);
bh.addToUI=(ui)=>{};
bh.tick=()=>{};





let iniCondLine = function(index, time, spread){
    let pos = new Vector3(3,0,15);
    let vel = new Vector3(-Math.cos(Math.sin(0.*time)/15+index/30),-Math.sin(Math.sin(0.*time)/15+index/30),-2.65).normalize().multiplyScalar(Math.sin(time/5)*Math.sin(time/5));
    return new State(pos,vel);
}

let iniCondCone = function(index,time,spread,totalNum=10){
    let pos = new Vector3(-15,0,0);
    let vel = new Vector3(4.5, Math.cos(2*Math.PI*index/totalNum),Math.sin(2*Math.PI*index/totalNum)).normalize().multiplyScalar(Math.sin(time/5)*Math.sin(time/5));
    return new State(pos,vel);
}


let iniCond1 = function(index,time,spread,totalNum=10){
    let pos = new Vector3(-10,0,0);
    let vel = new Vector3(2.5, Math.cos(0.3*index/totalNum),Math.sin(0.3*index/totalNum)).normalize().multiplyScalar(Math.sin(time/5)*Math.sin(time/5));
    return new State(pos,vel);
}

let iniCond2 = function(index,time,spread,totalNum=10){
    let pos = new Vector3(-10,0,0);
    let vel = new Vector3(2.5, Math.cos(0.3*index/totalNum+2.),Math.sin(0.3*index/totalNum+2.)).normalize().multiplyScalar(Math.sin(time/5)*Math.sin(time/5));
    return new State(pos,vel);
}



const optionGenerator = function(n){
    return {
        length: 25,
        segments: 300,
        radius: 0.05/(1+(0.2*n)*(0.2*n)),
        tubeRes: 8,
        color: 0xe0a422,
    }
}







const range = {
    min:-5,
    max:5,
}

const stop = function(state){
    if(state.pos.length()<bh.radius){
        return true;
    }
    return false;
}

let identity = function(pos){return pos};




const geoSpray = new IntegralCurveSpray(bh.nullIntegrator, identity, iniCondCone, optionGenerator, stop, range );
geoSpray.tick = function(time,dTime){
    geoSpray.update(time);
}
geoSpray.addToUI=function(ui){}


//
// const geoSpray2 = new IntegralCurveSpray(bh.nullIntegrator, identity, iniCond2, optionGenerator, stop, range );
// geoSpray2.tick = function(time,dTime){
//     geoSpray2.update(time);
// }






// make an accretion disk:

class AccretionDisk{
    constructor(inner, outer, thickness){

        const diskMaterial = new MeshPhysicalMaterial(
            {
                clearcoat:1,
                side: DoubleSide,
            }
        );

        const face = new RingBufferGeometry(inner,outer,32);


        const innerEdge = new CylinderBufferGeometry(inner,inner,thickness,32,1, true);
        const outerEdge = new CylinderBufferGeometry(outer, outer, thickness,32,1,true);

        this.top = new Mesh(face,diskMaterial);
        this.top.rotateX(Math.PI/2);
        this.top.position.set(0,thickness/2,0);

        this.bottom = new Mesh(face,diskMaterial);
        this.bottom.rotateX(Math.PI/2);
        this.bottom.position.set(0,-thickness/2,0);

        this.inside = new Mesh(innerEdge, diskMaterial);
        this.outside = new Mesh(outerEdge,diskMaterial);

        this.disk = new Group();
        this.disk.add(this.top);
        this.disk.add(this.bottom);
        this.disk.add(this.inside);
        this.disk.add(this.outside);

    }

    addToScene(scene){
        scene.add(this.disk);
    }

    addToUI(ui){}

    tick(time,dTime){}
}

let accDisk = new AccretionDisk(2,4,0.2);










export default {
    blackhole: bh,
    spray: geoSpray,
  //  spray2: geoSpray2,
    acc: accDisk,
};
