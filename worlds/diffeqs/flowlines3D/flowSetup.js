import {Vector3} from "../../../3party/three/build/three.module.js";
import {RungeKutta} from "../../../code/compute/cpu/RungeKutta.js";
import {FlowLine} from "../../../code/components/odes/FlowLine.js";
import {FlowLineField} from "../../../code/components/odes/FlowLineField.js";


const ep = 0.01;

const derive = ( state ) => {
    const x = state.x;
    const y = state.y;
    const z = state.z;

    const a = 0.95;
    const b = 0.7;
    const c = 0.6;
    const d = 3.5;
    const e = 0.25;
    const f = 0.1;

    const vx = (z-b) * x - d*y;
    const vy = d*x + (z-b)*y;
    const vz = c + a*z - z*z*z/3. - (x*x+y*y)*(1.+e*z) + f*z*x*x*x;

    return new Vector3(vx,vy,vz);

}

const diffEq = new RungeKutta( derive, ep);
let iniState = new Vector3(1,1,1);

let integralCurve = new FlowLine( diffEq, iniState, 10 );
integralCurve.addToUI=function(ui){};
integralCurve.tick=function(time,dTime){
    this.step();
};

let flowLines = new FlowLineField( diffEq,100, 0.2);
flowLines.addToUI=function(ui){};
flowLines.tick=function(time,dTime){
    this.step();
};








let flowSetup = {
    curve: integralCurve,
    lines: flowLines,
};


export default flowSetup;
