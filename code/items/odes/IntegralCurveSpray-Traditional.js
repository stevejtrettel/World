
import {IntegralCurve} from "./IntegralCurve-Traditional.js";


//iniCondGenerator is a function that takes a number and spits out a state
//optionsGenerator is a function that takes a number and spits out a state
//range is a set {min:xxx, max:xxx} that tells us which numbers to plug in to make
//stop is a function that tells us when to stop integrating an integral curve

class IntegralCurveSpray{
    constructor(integrator, parameterization, iniCondGenerator, optionsGenerator, stop, range ){

        this.N = range.max-range.min+1;
        this.range = range;
        this.curves = [];
        this.ini = iniCondGenerator;

        let state, curveOptions;
        let intCurve;
        for( let n=range.min; n<this.range.max+1; n++ ){
            curveOptions = optionsGenerator(n);
            state = this.ini(n,0);
            intCurve = new IntegralCurve(integrator, parameterization, state, curveOptions, stop);
            this.curves.push(intCurve);
        }
    }

    addToScene(scene){
        for(const curve of this.curves){
            curve.addToScene(scene);
        }
    }

    update(t){
        let i,state;
        for( let n=this.range.min; n<this.range.max+1; n++ ){
            state=this.ini(n,t);
            i=n-this.range.min;
            this.curves[i].integrate(state);
            this.curves[i].resetCurve();
        }
    }
}


export default IntegralCurveSpray;