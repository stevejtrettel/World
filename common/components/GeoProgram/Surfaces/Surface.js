// the base class for surfaces and computations:
import {Vector3,Vector2} from "../../../../3party/three/build/three.module.js";

import dState from "../Integrator/dState.js";
import Integrator from "../Integrator/Integrator.js";

class Surface{
    constructor(domain){

        this.domain = domain;


        this.setFunctionDerivatives();
        this.buildParameterization();
        this.buildAcceleration();
        this.buildIntegrator();
        this.buildSurfaceGeometry();

    }

    //this will be written in each function individually:
    setFunctionDerivatives(){
        this.F=null;
        this.derivatives=null;
    }

    buildParameterization(){
        let F = this.F;
        this.parameterization = function(uv){
            let u = uv.x;
            let v = uv.y;
            //switch order so z is up on screen
            return new Vector3(u,F(u,v),-v);
        }
    }

    buildAcceleration(){
        let derivatives = this.derivatives;
        let acceleration = function(state){
            let uv = state.pos;
            let u = state.pos.x;
            let v = state.pos.y;
            let uP = state.vel.x;
            let vP = state.vel.y;

            let D = derivatives(uv);

            let num = uP*uP*D.fuu + 2*uP*vP*D.fuv + vP*vP*D.fvv;
            let denom = 1+ D.fu*D.fu + D.fv*D.fv;
            let coef = -num/denom;

            let acc = new Vector2(D.fu,D.fv).multiplyScalar(coef);
            return acc;
        }

        this.acceleration = acceleration;
        this.derive = function(state){
            let vel = state.vel;
            let acc = acceleration(state);
            return new dState(vel,acc);
        }
    }

    buildIntegrator(){
        let derive = this.derive;
        let ep = 0.1;
        this.integrator = new Integrator(derive,ep);
    }

    buildSurfaceGeometry(){
        let parameterization = this.parameterization;
        let uDom = this.domain.u;
        let vDom = this.domain.v;

        let rescaleU = function(u){
            return uDom.min + (uDom.max-uDom.min)*u;
        }

        let rescaleV = function(v){
            return vDom.min + (vDom.max-vDom.min)*v;
        }

        let rescale = function(uv){
            return new Vector2(rescaleU(uv.x),rescaleV(uv.y));
        }

        this.surfaceFn = function(uv){
            let UV = rescale(uv);
            return parameterization(UV);
        }
    }


}


export default Surface;