import IntegralCurve from "../Integrator/IntegralCurve.js";


//essentially a wrapper for IntegralCurve that takes in a compute class
//and pulls out the acceleration to build the integrator

const defaultOptions = {
    length:5,
    //stop: function(u,v){return false;},
    color: 0xffffff,
    radius: 0.05,
    res: 100,
}


class Geodesic{
    constructor(compute, iniState, params, curveOptions = defaultOptions) {

        this.compute = compute;
        this.iniState = iniState;

        this.params = params;
        this.curveOptions = curveOptions;

        this.stop = this.compute.outsideDomain;

        this.ep = 0.1;

        this.curve = new IntegralCurve(
            this.compute.geodesicIntegrator,
            this.compute.parameterization,
            this.iniState,
            this.stop,
            this.curveOptions
        );

    }

    addToScene(scene){
        this.curve.addToScene(scene);
    }


    //hopefully if we reset the compute system's internals, it'll auto update here
    //otherwise we'll need a "reset compute" method



    update(params){
        //run through this.params and update values if they exist:

        //get new initial state if it exists:
        this.iniState = params.iniState;
        console.log(this.iniState);
        //are there other things that might be in params that aren't just this.params?

        this.curve.update(this.iniState);
    }
}


export default Geodesic;