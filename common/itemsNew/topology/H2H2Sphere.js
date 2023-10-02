import {Vector3} from "../../../3party/three/build/three.module.js";



import {State,dState} from "../../compute/cpu/components/State.js";
import RungeKutta from "../../compute/cpu/RungeKuttaParams.js";
import {IntegralCurve} from "../../components/odes/IntegralCurve-Traditional.js";
import IntegralCurveSpray from "../../components/odes/IntegralCurveSpray-Traditional.js";
import Item from "../Item.js";


let defaultSettings = {
    ep:0.01,
    iniPos: new Vector3(0,0,0),
    iniVel:  new Vector3(1,1,0),
    R:1,
}


let iniCondCone = function(index,time,spread,totalNum=10){
    let pos = new Vector3(0,0,0);
    let vel = new Vector3(4.5, Math.cos(2*Math.PI*index/totalNum),Math.sin(2*Math.PI*index/totalNum)).normalize().multiplyScalar(Math.sin(time/5)*Math.sin(time/5));
    return new State(pos,vel);
}


const optionGenerator = function(n){
    return {
        length: 25,
        segments: 300,
        radius: 0.05/(1+(0.2*n)*(0.2*n)),
        tubeRes: 8,
        color: 0xe0a422,
    }
}


const stop = function(state){
    if(state.pos.length()<10.){
        return true;
    }
    return false;
}


class H2H2Sphere extends Item {
    constructor(settings = defaultSettings) {

        super(settings);

        this.derive = (state,params)=>{
            let R = 1;
            let phi1 = state.pos.x;
            let phi2 = state.pos.y;
            let theta = state.pos.z;
            let dPhi1 = state.vel.x;
            let dPhi2 = state.vel.y;
            let dTheta = state.vel.z;

            let phi1Acc =0.;
            let phi2Acc=0;
            let thetaAcc=0;

            let acc = new Vector3(phi1Acc,phi2Acc,thetaAcc);

            return new dState(state.vel.clone(),acc);
        };

        this.parameterization = (p) => {
            let phi1 = p.x;
            let phi2 = p.y;
            let theta = p.z;

            let x = phi1;
            let y = phi2;
            let z = theta;

            return new Vector3(x,y,z);
        };



        this.integrator = new RungeKutta(this.derive, this.params.ep);
        this.iniState = new State(this.params.iniPos,this.params.iniVel);
        this.curve = new IntegralCurve(this.integrator,this.parameterization,this.iniState);
        this.spray = new IntegralCurveSpray(this.integrator,this.parameterization,iniCondCone,optionGenerator,stop,10);

    }

    addToScene(scene){
        this.curve.addToScene(scene);
        this.spray.addToScene(scene);
    }

    addToUI(ui){

    }

    tick(time,dTime){
        this.spray.update(time);
    }

}


export default H2H2Sphere;