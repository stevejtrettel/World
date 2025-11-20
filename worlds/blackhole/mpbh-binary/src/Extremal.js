import {Vector3} from "../../../../3party/three/build/three.module.js";

import {State} from "../../../../code/compute/cpu/components/State.js";
import {IntegralCurve} from "../../../../code/items/odes/IntegralCurve-Traditional.js";

import MPBH from "../../../../code/items/geometry/MPBH.js";


import bhBinary from "./bhBinary.js";

const lightOptions = {
    length:150,
    segments: 1024,
    radius: 0.02,
    tubeRes:8,
    color: 0xffffff,
    roughness:0,
};


class Extremal{
    constructor(){

        this.bh = new MPBH(bhBinary);

        this.iniCond = new State( new Vector3(-3,0,0),new Vector3(1,0,1.5));
        this.iniCond = this.bh.normalize(this.iniCond);


        this.params = {px:0.0, vy:0,vz:1.5, animate:true};;

        //integrator, parameterization, state, options=defaultOptions, stop=defaultStop
        let id= function(pos){
            return pos;
        }

        let stop = function(state){
            if(state.pos.length()>100.){
                return true;
            }
            return false;
        }

        this.light = new IntegralCurve(this.bh.integrator,id,this.iniCond,lightOptions,stop);
        this.light.integrate(this.iniCond);
    }

    addToScene(scene){
        this.bh.addToScene(scene);
        this.light.addToScene(scene);
    }

    addToUI(ui){

        let params = this.params;
        //items to be changed in function:
        let bh = this.bh;
        let light = this.light;
        let iniCond = this.iniCond;


        ui.add(params,'animate');

        ui.add(params, 'px',0,1,0.001).onChange(function(value){
            iniCond.pos.x = -3 + 10*value;
            iniCond = bh.normalize(iniCond);
            light.update(iniCond);
        });

        ui.add(params, 'vy',-1.5,1.5,0.001).onChange(function(value){
            iniCond.vel.y = value;
            iniCond = bh.normalize(iniCond);
            light.update(iniCond);
        });

        ui.add(params, 'vz',-1.5,1.5,0.001).onChange(function(value){
            iniCond.vel.z = value;
            iniCond = bh.normalize(iniCond);
            light.update(iniCond);
        });

    }

    tick(time,dTime){

        if(this.params.animate){
            this.iniCond.vel.y = Math.sin(time);
            this.iniCond = this.bh.normalize(this.iniCond);
            this.light.update(this.iniCond);
        }

        // let value = 0.01*Math.sin(time/30.);
        // this.iniCond =  new State( new Vector3(-2,-2,-2),new Vector3(1,0.446+0.01*value,0));
        // this.light.update( this.bh.normalize(this.iniCond));

    }
}


export default Extremal;
