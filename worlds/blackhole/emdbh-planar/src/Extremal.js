import {Vector3} from "../../../../3party/three/build/three.module.js";

import {State} from "../../../../code/compute/cpu/components/State.js";
import {IntegralCurve} from "../../../../code/items/odes/IntegralCurve-Traditional.js";
import EMDBH from "../../../../code/items/geometry/EMDBH.js";


import bhTriangle from "./bhTriangle.js";

const lightOptions = {
    length:40,
    segments: 1024,
    radius: 0.02,
    tubeRes:8,
    color: 0xffffff,
    roughness:0,
};


class Extremal{
    constructor(){

        this.bh = new EMDBH(1.,bhTriangle);

        this.iniCond = new State( new Vector3(-3,0,0),new Vector3(0.53,0.5,0));
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

        let params = {alpha:2};

        //items to be changed in function:
        let bh = this.bh;
        let light = this.light;
        let iniCond = this.iniCond;

        ui.add(params, 'alpha',1,2.5,0.01).onChange(function(value){
            bh.updateAlpha(value);

            light.resetIntegrator(bh.integrator);
            light.update( bh.normalize(iniCond));
        })


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
