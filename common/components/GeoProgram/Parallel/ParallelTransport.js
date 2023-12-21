import {SplineCurve} from "../../../../3party/three/build/three.module.js";
import State from "../Integrator/State.js";
import TransportIntegrator from "./TransportIntegrator.js";

class ParallelTransport{
    constructor(iniVector, curveFn, surface) {

        this.surface=surface;
        this.buildCurve(curveFn);
        this.iniVector=iniVector;

        this.ep = 0.01;
        this.initialize();
    }

    buildCurve(curveFn){
        let curvePts = [];
        for(let i=0;i<100;i++){
            curvePts.push(curveFn(i/100));
        }
        this.curve = new SplineCurve(curvePts);
    }

    initialize(){

        this.integrator = new TransportIntegrator(this.curve,this.surface,this.ep);

        this.vecs = [];
        let vec = this.iniVector;
        let t=0;
        for(let i=0; i<1/this.ep; i++){
            this.vecs.push(vec);
            t=this.ep*i;
            vec = this.integrator.step(vec,t);
        }
        this.parallelField = new SplineCurve(this.vecs,false);
    }

    updateVector(iniVec){
        this.iniVector=iniVec;
        this.initialize();
    }

    updateSurface(surface){
        this.surface = surface;
        this.initialize();
    }

    updateCurve(curve){
        this.curve = curve;
        this.initialize();
    }

    getVector(t){
        let pos = this.curve.getPointAt(t);
        let vec = this.parallelField.getPointAt(t);
        return new State(pos,vec);
    }
}


export default ParallelTransport;