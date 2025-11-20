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
    spread:1,
    approach:0,
}

//setup for the geodesics
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

let iniCond = function(index, time, spread){
    let pos = new Vector3(-13,-2.675,0.5*index/30);
    let vel = new Vector3( 1,0,0);
    return new State(pos,vel);
}

const optionGenerator = function(n){
    return {
        length: 50,
        segments: 500,
        radius: 0.02/(1+(0.2*n)*(0.2*n)),
        tubeRes: 8,
        color: 0xffea70,
    }
}

const geoSpray = new IntegralCurveSpray(bh.nullIntegrator, identity, iniCond, optionGenerator, stop, range );
geoSpray.update(0);

geoSpray.addToUI = (ui)=>{
    ui.add(params,'approach',-0.25,0.25,0.001).onChange(function (value){
        geoSpray.update();
    });
    ui.add(params,'spread',0,10,0.01).onChange(function (value){
        geoSpray.update();
    });
};

geoSpray.tick=()=>{};










export default {
    blackhole: bh,
    spray: geoSpray,
};
