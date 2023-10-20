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

        this.ep = 0.1;

        this.curve = new IntegralCurve(
            this.surface.integrator,
            this.surface.parameterization,
            this.iniState,
            this.curveOptions,
        );

    }

    addToScene(scene){
        this.curve.addToScene(scene);
    }

    updateSurface(){
        this.curve.updateIntegrator(this.surface.integrator,this.surface.parameterization);
    }

    update(iniState){
        //get new initial state if it exists:
        this.iniState = iniState
        this.curve.update(this.iniState);
    }

    setVisibility(value){
        this.curve.setVisibility(value);
    }

    printToString(numPts=500){
        return this.curve.generatePoints(numPts)+`\n\n`;
    }

    printToFile(fileName='geodesic', numPts=500){
        this.curve.generatePoints(numPts);
        this.curve.downloadPoints(fileName);
    }

}


export default Geodesic;