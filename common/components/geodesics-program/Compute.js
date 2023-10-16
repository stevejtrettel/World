import State from "./Integrator/State.js";
import dState from "./Integrator/dState.js";
import Integrator from "./Integrator/Integrator.js";

import {Vector2,Vector3} from "../../../3party/three/build/three.module.js";

// a class to do all the computations for the surface we might need:
// it takes in the parameterization and the domain
// stores functions as objects to be given out to other things (prly not best practice?)
// everything that draws part of the scene takes Compute as an argument, and reads the data out of her
// that way its a one size fits all receptacle for information about the problem

class Compute {
    constructor() {

        //things we should take as input!
        //this.F, this.domain, this.params
        this.F = function(u,v){
            return Math.exp(-(u*u+v*v));
        }
        this.domain = {u:{min:-2,max:2}, v:{min:-2,max:2}};
        this.params = {};

        //the parametric function (so we can pass it off)
        this.buildParameterization();
        //the acceleration function (so that we can pass it off)
        this.takeDerivatives();
        this.buildAcceleration();
        this.buildGeodesicIntegrator();

    }



    buildParameterization(){
        //this creates the components:
        //this.parameterization (u,v)->Vector3
        //this.rescaleU, this.rescaleV: float -> float
        //this.parametricSurface: (u,v,dest) for ParametricGeometry
        let F = this.F;
        let parameterization = function(u,v){
            return new Vector3(u,F(u,v),-v);
        }
        this.parameterization = parameterization;

        //build the rescalers:
        let domU = this.domain.u;
        let domV = this.domain.v;
        let rescaleU = function(u){
            return domU.min + (domU.max - domU.min)*u;
        }
        this.rescaleU = rescaleU;

        let rescaleV = function(v){
            return domV.min + (domV.max - domV.min)*v;
        }
        this.rescaleV = rescaleV;

        //now build the parametric surface function:
        this.parametricSurface = function(u,v,dest){
            let U = rescaleU(u);
            let V = rescaleV(v);
            let res = parameterization(U,V);
            dest.set(res.x,res.y,res.z);
        }

        //function that returns if we are in the domain (useful for cutting off geodesics, etc)
        this.outsideDomain = function(u,v){
            if(u<domU.min || u>domU.max){
                return true;
            }
            if(v<domV.min || v>domV.max){
                return true;
            }
            return false;
        }
    }


    takeDerivatives(){
        let F = this.F;

        this.derivatives = function(u,v){

            let ep = 0.0001;

            let f00 = F(u,v);

            let fp0 = F(u+ep, v);
            let fn0 = F(u-ep, v);
            let f0p = F(u,v+ep);
            let f0n = F(u,v-ep);

            let fpp = F(u+ep,v+ep);
            let fpn = F(u+ep, v-ep);
            let fnp = F(u-ep, v+ep);
            let fnn = F(u-ep, v-ep);

            return {
                fu: (fp0-fn0)/(2*ep),
                fv: (f0p-f0n)/(2*ep),
                fuu: (-fp0+2*f00-fn0)/(ep*ep),
                fvv: (-f0p+2*f00-f0n)/(ep*ep),
                fuv: (fpp - fpn - fnp + fnn)/(4*ep*ep)
            };
        }
    }

    //computes the geodesic acceleration
    //this is a function state -> dState
    buildAcceleration(){

        let derivatives = this.derivatives;

        this.acceleration = function(state){
            let u = state.pos.x;
            let v = state.pos.y;
            let uP = state.vel.x;
            let vP = state.pos.y;
            let D = derivatives(u,v);

            let numerator=vP*vP*D.fvv + 2*uP*vP*D.fuv + uP*uP*D.fuu;
            let denominator=1 + D.fuu*D.fuu + D.fvv*D.fvv;
            let coef = numerator/denominator;

            let acc = new Vector2(D.fu,D.fv);
            acc.multiplyScalar(-coef);

            return  new dState(state.vel, acc);
        }
    }

    buildGeodesicIntegrator(){
        //make the geodesicIntegrator:
        this.ep = 0.1;
        this.geodesicIntegrator = new Integrator(this.acceleration,this.ep);
    }

    update(params){
        //update all the parameters we need here

        //then rerun everything to reset:
        this.buildParameterization();
        this.takeDerivatives();
        this.buildAcceleration();
        this.buildGeodesicIntegrator();
    }


}



export default Compute;