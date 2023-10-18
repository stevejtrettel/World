import IntegralCurve from "../Integrator/IntegralCurve.js";

//essentially a wrapper for IntegralCurve that takes in a compute class
//and pulls out the acceleration to build the integrator

const defaultOptions = {
    length:20,
    color: 0xffffff,
    radius: 0.05,
    res: 100,
}

class Geodesic{
    constructor(surface, iniState, curveOptions = defaultOptions) {

        this.surface = surface;
        this.iniState = iniState;
        this.curveOptions = curveOptions;
        this.stop = function(state){return false;}
            //this.surface.outsideDomain;

        this.ep = 0.1;

        this.curve = new IntegralCurve(
            this.surface.integrator,
            this.surface.parameterization,
            this.iniState,
            this.curveOptions,
            this.stop
        );

    }

    addToScene(scene){
        this.curve.addToScene(scene);
    }

    update(iniState){
        //get new initial state if it exists:
        this.iniState = iniState
        this.curve.update(this.iniState);
    }

    printPoints(fileName='geodesic', numPts=500){
        this.curve.generatePoints(numPts);
        this.curve.downloadPoints(fileName);
    }

    setVisibility(value){
        this.curve.setVisibility(value);
    }

}


export default Geodesic;