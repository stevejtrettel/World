import IntegralCurve from "../Integrator/IntegralCurve.js";


//essentially a wrapper for IntegralCurve that takes in a compute class
//and pulls out the acceleration to build the integrator

const defaultParams = {
    length:5,
    stop: function(u,v){return false;},
    color: 0xffffff,
    radius: 0.15,
    res: 100,
}


class Geodesic{
    constructor(compute,iniState, params=defaultParams) {
        this.compute = compute;
        this.iniState = iniState;
        this.params = params;

        this.ep = params.ep || 0.1;

        this.curve = new IntegralCurve(
            this.compute.geodesicIntegrator,
            this.compute.parameterization,
            this.iniState,
            this.params);
    }

    addToScene(scene){
        this.curve.addToScene(scene);
    }


    //hopefully if we reset the compute system's internals, it'll auto update here
    //otherwise we'll need a "reset compute" method


    update(){

    }
}


export default Geodesic;