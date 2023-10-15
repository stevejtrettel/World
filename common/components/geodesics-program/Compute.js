import State from "./Integrators/State.js";
import dState from "./Integrators/dState.js";
import {Vector2,Vector3} from "../../../3party/three/build/three.js";
import Integrator from "./Integrators/Integrator";


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
    }


    takeDerivatives(){
        //this builds the partial derivative functions
        //this.Fu, this.Fv
        //and the second partials this.Fuu, this.Fvv. this.Fuv

        let F = this.F;
        //build the functions that are the first derivatives:
        this.Fu = function(u,v){
            return -2*u*F(u,v);
        }
        this.Fv = function(u,v){
            return - 2*v*F(u,v);
        }

        //now build the second derivatives:
        this.Fuu = function(u,v){
            return (4*u*u-2)*F(u,v);
        }
        this.Fvv = function(u,v){
            return (4*v*v-2)*F(u,v);
        }
        this.Fuv = function(u,v){
            return 4*u*v*F(u,v);
        }
    }

    //computes the geodesic acceleration
    //this is a function state -> dState
    buildAcceleration(){
        let f = this.F;
        let fu = this.Fu;
        let fv = this.Fv;
        let fuu = this.Fuu;
        let fuv = this.Fuv;
        let fvv = this.Fvv;

        this.acceleration = function(state){
            let u = state.pos.x;
            let v = state.pos.y;
            let uP = state.vel.x;
            let vP = state.pos.y;

            let numerator=vP*vP*fvv(u,v)+2*uP*vP*fuv(u,v)+uP*uP*fuu(u,v);
            let denominator=1+fuu(u,v)*fuu(u,v)+fvv(u,v)*fvv(u,v);
            let coef = numerator/denominator;

            let acc = new Vector2(fu(u,v),fv(u,v));
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