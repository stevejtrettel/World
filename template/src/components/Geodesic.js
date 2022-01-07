import { Vector2, Vector3 } from "../../../3party/three/build/three.module.js";

import { IntegralCurve } from "../../../common/objects/IntegralCurve.js";
import { State, dState } from "../../../common/integration/State.js";
import { RungeKutta } from "../../../common/integration/RungeKutta.js";


const accel = ( state ) => {

    let u = state.pos.x;
    let v = state.pos.y;
    let uP = state.vel.x;
    let vP = state.vel.y;

    //For Torus
    let uAcc = 2 * uP * vP * Math.sin(v) / (2 + Math.cos(v));
    let vAcc = -(2 + Math.cos(v)) * uP * uP * Math.sin(v);

    let acc = new Vector2( uAcc, vAcc );

    return acc;
};


const derive = ( state ) => {
    let vel = state.vel;
    let acc = accel( state );
    return new dState( vel, acc );
};

const integrator = new RungeKutta(derive, 0.05);

const iniState = new State( new Vector2(0,0), new Vector2(1,1) );

const parameterization = ( uv ) => {
    let u = uv.x;
    let v = uv.y;
    let x = (2+Math.cos(v))*Math.cos(u);
    let y = (2+Math.cos(v))*Math.sin(u);
    let z = Math.sin(v);
    return new Vector3(x,y,z);
};




const geodesic = new IntegralCurve( integrator, parameterization, iniState, 100.);

geodesic.tick= function( time, dTime ){
    let iniState = new State( new Vector2(0,0), new Vector2(Math.cos(time/10),Math.sin(time/10)));
    geodesic.integrate(iniState);
    geodesic.resetCurve(geodesic.curve);
}

const geo = {
    tube: geodesic,
}

export { geo };
