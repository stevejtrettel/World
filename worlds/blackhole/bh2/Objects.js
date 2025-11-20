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
    approach: 0,
}


let iniCondLine = function(index, time=0, spread=params.spread,approach=params.approach){
    let pos = new Vector3(-10,spread*0.125*index/30-1.2,-2.388+approach);
    let vel = new Vector3(2.65,0,0).normalize();
    return new State(pos,vel);
}


const optionGenerator = function(n){
    return {
        length: 50,
        segments: 500,
        radius: 0.02/(1+(0.1*n)*(0.1*n)),
        tubeRes: 8,
        color: 0xffd70f,
    }
}


const range = {
    min:-20,
    max:20,
}

const stop = function(state){
    if(state.pos.length()<bh.radius-0.4){
        return true;
    }
    return false;
}

let identity = function(pos){return pos};


const geoSpray = new IntegralCurveSpray(bh.nullIntegrator, identity, iniCondLine, optionGenerator, stop, range );
geoSpray.update(0);


geoSpray.addToUI = (ui)=>{
    ui.add(params,'approach',-1,1,0.01).onChange(function (value){
        geoSpray.update();
    });
    ui.add(params,'spread',0,5,0.01).onChange(function (value){
        geoSpray.update();
    });
};

geoSpray.tick=()=>{};










export default {
    blackhole: bh,
    spray: geoSpray,
};
