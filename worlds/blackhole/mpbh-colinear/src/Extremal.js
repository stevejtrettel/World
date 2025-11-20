import {Vector3} from "../../../../3party/three/build/three.module.js";

import {State} from "../../../../code/compute/cpu/components/State.js";
import {IntegralCurve} from "../../../../code/items/odes/IntegralCurve-Traditional.js";
import EMDBH from "../../../../code/items/geometry/EMDBH.js";
import MPBH from "../../../../code/items/geometry/MPBH.js";


import bhLine from "./bhLine.js";

const lightOptions = {
    length:200,
    segments: 2048,
    radius: 0.02,
    tubeRes:8,
    color: 0xffffff,
    roughness:0,
};


class Extremal{
    constructor(){

        this.bh = new MPBH(bhLine);

        this.iniCond = new State( new Vector3(-3,0,0),new Vector3(0.53,0.75,0));
        this.iniCond = this.bh.normalize(this.iniCond);

        //integrator, parameterization, state, options=defaultOptions, stop=defaultStop
        let id= function(pos){
            return pos;
        }

        this.light = new IntegralCurve(this.bh.integrator,id,this.iniCond,lightOptions);
        this.light.integrate(this.iniCond);
    }

    addToScene(scene){
        this.bh.addToScene(scene);
        this.light.addToScene(scene);
    }

    addToUI(ui){

        let params = {
            p:3,
            vx:0.1,
            vy:0.1,
            vz:0.1,
        };

        //items to be changed in function:
        let bh = this.bh;
        let light = this.light;
        let iniCond = this.iniCond;



        // ui.add(params, 'vx',-1,1,0.001).onChange(function(value){
        //     params.vx = value;
        //     iniCond =  new State( new Vector3(-3,0,0),new Vector3(value,0,params.vy));
        //     light.update( bh.normalize(iniCond));
        // });



        ui.add(params, 'p',0.5,4,0.001).onChange(function(value){
            params.vx = value;
            iniCond =  new State( new Vector3(-value,0,0),new Vector3(params.vx,params.vy,params.vz));
            light.update( bh.normalize(iniCond));
        });



        ui.add(params, 'vx',-1,1,0.001).onChange(function(value){
            params.vx = value;
            iniCond =  new State( new Vector3(-3,0,0),new Vector3(value,params.vy,params.vz));
            light.update( bh.normalize(iniCond));
        });



        ui.add(params, 'vy',-1,1,0.001).onChange(function(value){
            params.vy = value;
            iniCond =  new State( new Vector3(-3,0,0),new Vector3(params.vx,value,params.vz));
            light.update( bh.normalize(iniCond));
        });


        ui.add(params, 'vz',-1,1,0.001).onChange(function(value){
            params.vy = value;
            iniCond =  new State( new Vector3(-3,0,0),new Vector3(params.vx,params.vy,value));
            light.update( bh.normalize(iniCond));
        });

    }

    tick(time,dTime){
       // let alpha = 1.5+0.2*Math.sin(time);
       //  this.bh.updateAlpha(alpha);
       //
       //  this.iniCond= this.bh.normalize(this.iniCond);
       //  this.light.resetIntegrator(this.bh.integrator);
       //  this.light.update(this.iniCond);
    }
}


export default Extremal;
