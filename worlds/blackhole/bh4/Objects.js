import {
    CylinderGeometry,
    MeshPhysicalMaterial,
    RingGeometry,
    Vector2,
    Vector3,
    Mesh,
    Group, DoubleSide,
} from "../../../3party/three/build/three.module.js";

import {BlackHole} from "../../../code/items/misc/BlackHole.js";
import { State } from "../../../code/compute/cpu/components/State.js";
import IntegralCurveSpray from "../../../code/items/odes/IntegralCurveSpray-Traditional.js";



let bh = new BlackHole(0.5,0.05);
bh.addToUI = (ui)=>{};
bh.tick=()=>{};


let params = {
    radius:1,
}


//setup for the geodesics

const range = {
    min:-20,
    max:20,
}

const stop = function(state){
    if(state.pos.length()<bh.radius-0.2){
        return true;
    }
    return false;
}

let identity = function(pos){return pos};




//spray #1

let iniCondCyl = function(index, time=0,radius=params.radius){
    let r = 5;
    let tau = 2.*Math.PI;
    let pos = new Vector3(-10,params.radius*r*Math.cos(tau*index/41),params.radius*r*Math.sin(tau*index/41));
    let vel = new Vector3(1,0,0).normalize();
    return new State(pos,vel);
}

let optionGenerator = function(index){
    return{
        length: 30,
        segments: 200,
        radius: 0.01,
        tubeRes: 8,
        color: '#f9ff9f',
    }
};


const geoSpray = new IntegralCurveSpray(bh.nullIntegrator, identity, iniCondCyl, optionGenerator, stop, range );
geoSpray.update(0);

geoSpray.addToUI = (ui)=>{
    ui.add(params,'radius',0,1,0.01).onChange(function (value){
        geoSpray.update();
    });
};

geoSpray.tick=()=>{};










export default {
    blackhole: bh,
    spray: geoSpray,
};
