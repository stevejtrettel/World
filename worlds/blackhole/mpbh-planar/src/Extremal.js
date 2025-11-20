import {Vector3} from "../../../../3party/three/build/three.module.js";

import {State} from "../../../../code/compute/cpu/components/State.js";
import {IntegralCurve} from "../../../../code/items/odes/IntegralCurve-Traditional.js";
import EMDBH from "../../../../code/items/geometry/EMDBH.js";
import MPBH from "../../../../code/items/geometry/MPBH.js";


import bhTriangle from "./bhTriangle.js";

const lightOptions = {
    length:100,
    segments: 1024,
    radius: 0.02,
    tubeRes:8,
    color: 0xffffff,
    roughness:0,
};


class Extremal{
    constructor(){

        this.bh = new MPBH(bhTriangle);

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

        let params = {vy:0.7};

        //items to be changed in function:
        let bh = this.bh;
        let light = this.light;
        let iniCond = this.iniCond;

        ui.add(params, 'vy',0,1,0.001).onChange(function(value){
            iniCond =  new State( new Vector3(-3,0,0),new Vector3(0.53,value,0));
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
